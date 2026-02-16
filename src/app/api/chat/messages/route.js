import { auth } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/dbConnection";

function parseChannelSlug(slug) {
  if (!slug?.startsWith("dm-")) return null;
  const rest = slug.slice(3);
  const i = rest.indexOf("-");
  if (i === -1) return null;
  const a = rest.slice(0, i);
  const b = rest.slice(i + 1);
  return a && b ? [a, b] : null;
}

async function fetchAvatarUrls(clerkIds) {
  const ids = [...new Set(clerkIds.map((id) => String(id).trim()).filter(Boolean))];
  if (!ids.length) return {};
  try {
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    const results = await Promise.allSettled(
      ids.map((id) => clerk.users.getUser(id).then((u) => ({ id, url: u.imageUrl })))
    );
    const map = {};
    results.forEach((r, i) => {
      if (r.status === "fulfilled" && r.value?.url) map[ids[i]] = r.value.url;
    });
    return map;
  } catch {
    return {};
  }
}

export const GET = async (request) => {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const channel = new URL(request.url).searchParams.get("channel");
  if (!channel) return Response.json({ error: "channel required" }, { status: 400 });

  const clerkIds = parseChannelSlug(channel);
  if (!clerkIds) return Response.json({ error: "Invalid channel" }, { status: 400 });

  const conv = await db.query(
    `SELECT c.id FROM fm_conversations c
     JOIN fm_clients cl ON cl.id = c.client_id
     JOIN fm_freelancers f ON f.id = c.freelancer_id
     WHERE (cl.clerk_id = $1 AND f.clerk_id = $2) OR (cl.clerk_id = $2 AND f.clerk_id = $1)`,
    [clerkIds[0], clerkIds[1]]
  );
  const conversationId = conv.rows[0]?.id;
  if (!conversationId) return Response.json({ messages: [] });

  const { rows } = await db.query(
    "SELECT id, sender_id, content, created_at FROM fm_messages WHERE conversation_id = $1 ORDER BY created_at ASC",
    [conversationId]
  );
  const avatars = await fetchAvatarUrls(rows.map((m) => m.sender_id));

  const messages = rows.map((m) => {
    const sid = String(m.sender_id ?? "").trim();
    let text = m.content;
    let proposalJobId = null;
    try {
      const parsed = JSON.parse(m.content);
      if (parsed && parsed.type === "proposal") {
        text = parsed.text ?? m.content;
        proposalJobId = parsed.jobId ?? null;
      }
    } catch {
      // plain text message
    }
    return {
      id: m.id,
      name: "ADD",
      data: { text, proposalJobId, avatarUrl: avatars[sid] ?? null, senderId: sid },
      timestamp: m.created_at,
    };
  });
  return Response.json({ messages });
};

export const POST = async (request) => {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { channel, content } = body;
  if (!channel || content == null) {
    return Response.json({ error: "channel and content required" }, { status: 400 });
  }

  const clerkIds = parseChannelSlug(channel);
  if (!clerkIds) return Response.json({ error: "Invalid channel" }, { status: 400 });

  let conv = await db.query(
    `SELECT c.id FROM fm_conversations c
     JOIN fm_clients cl ON cl.id = c.client_id
     JOIN fm_freelancers f ON f.id = c.freelancer_id
     WHERE (cl.clerk_id = $1 AND f.clerk_id = $2) OR (cl.clerk_id = $2 AND f.clerk_id = $1)`,
    [clerkIds[0], clerkIds[1]]
  );

  if (!conv.rows[0]) {
    const [clients, freelancers] = await Promise.all([
      db.query("SELECT id FROM fm_clients WHERE clerk_id = ANY($1)", [clerkIds]),
      db.query("SELECT id FROM fm_freelancers WHERE clerk_id = ANY($1)", [clerkIds]),
    ]);
    const clientId = clients.rows[0]?.id;
    const freelancerId = freelancers.rows[0]?.id;
    if (!clientId || !freelancerId) {
      return Response.json({ error: "Client or freelancer not found" }, { status: 404 });
    }
    const insert = await db.query(
      "INSERT INTO fm_conversations (client_id, freelancer_id) VALUES ($1, $2) RETURNING id",
      [clientId, freelancerId]
    );
    conv = insert;
  }

  const conversationId = conv.rows[0].id;
  await db.query(
    "INSERT INTO fm_messages (conversation_id, sender_id, content) VALUES ($1, $2, $3)",
    [conversationId, userId, String(content)]
  );
  return Response.json({ ok: true });
};
