import { auth } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/dbConnection";

async function fetchAvatarUrls(clerkIds) {
  const ids = [...new Set(clerkIds.filter(Boolean))];
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

export const GET = async () => {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const [userRow, clientRow, freelancerRow] = await Promise.all([
    db.query("SELECT role FROM fm_users WHERE clerk_id = $1", [userId]),
    db.query("SELECT id FROM fm_clients WHERE clerk_id = $1", [userId]),
    db.query("SELECT id FROM fm_freelancers WHERE clerk_id = $1", [userId]),
  ]);
  const role = userRow.rows[0]?.role ?? null;
  const clientId = clientRow.rows[0]?.id;
  const freelancerId = freelancerRow.rows[0]?.id;

  let conversations = [];

  if (clientId) {
    const { rows } = await db.query(
      `SELECT c.id, f.clerk_id AS other_clerk_id, f.name AS other_name
       FROM fm_conversations c
       JOIN fm_freelancers f ON f.id = c.freelancer_id
       WHERE c.client_id = $1 ORDER BY c.created_at DESC`,
      [clientId]
    );
    conversations = rows.map((r) => ({
      id: r.id,
      channelSlug: "dm-" + [r.other_clerk_id, userId].sort().join("-"),
      otherParty: { clerkId: r.other_clerk_id, name: r.other_name },
    }));
  } else if (freelancerId) {
    const { rows } = await db.query(
      `SELECT c.id, cl.clerk_id AS other_clerk_id, cl.name AS other_name
       FROM fm_conversations c
       JOIN fm_clients cl ON cl.id = c.client_id
       WHERE c.freelancer_id = $1 ORDER BY c.created_at DESC`,
      [freelancerId]
    );
    conversations = rows.map((r) => ({
      id: r.id,
      channelSlug: "dm-" + [r.other_clerk_id, userId].sort().join("-"),
      otherParty: { clerkId: r.other_clerk_id, name: r.other_name },
    }));
  }

  const allClerkIds = [
    ...new Set(conversations.map((c) => c.otherParty?.clerkId).filter(Boolean)),
  ];
  const avatars = await fetchAvatarUrls(allClerkIds);

  const convsWithAvatar = conversations.map((c) => ({
    ...c,
    otherParty: { ...c.otherParty, imageUrl: avatars[c.otherParty?.clerkId] ?? null },
  }));

  if (convsWithAvatar.length > 0) {
    const { rows: lastRows } = await db.query(
      `SELECT DISTINCT ON (conversation_id) conversation_id, content, sender_id, created_at
       FROM fm_messages WHERE conversation_id = ANY($1::uuid[])
       ORDER BY conversation_id, created_at DESC`,
      [convsWithAvatar.map((c) => c.id)]
    );
    const lastByConv = Object.fromEntries(
      lastRows.map((m) => {
        let content = m.content;
        try {
          const parsed = JSON.parse(m.content);
          if (parsed?.type === "proposal" && parsed.text) content = parsed.text;
          else if (parsed?.type === "proposal_accepted") content = "Proposal accepted";
          else if (parsed?.type === "proposal_denied") content = "Proposal denied";
        } catch {
          // keep raw content
        }
        return [
          m.conversation_id,
          { content, createdAt: m.created_at, senderId: m.sender_id },
        ];
      })
    );
    const convsWithLast = convsWithAvatar.map((c) => ({
      ...c,
      lastMessage: lastByConv[c.id] ?? null,
    }));
    return Response.json({ role, conversations: convsWithLast, contacts: [] });
  }

  const resolvedRole = clientId ? "client" : freelancerId ? "freelancer" : role;
  return Response.json({ role: resolvedRole, conversations: [], contacts: [] });
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
  const otherClerkId = body?.otherClerkId ?? body?.freelancerClerkId;
  if (!otherClerkId || typeof otherClerkId !== "string") {
    return Response.json({ error: "otherClerkId required" }, { status: 400 });
  }

  const [clientRow, freelancerRow] = await Promise.all([
    db.query("SELECT id FROM fm_clients WHERE clerk_id = $1", [userId]),
    db.query("SELECT id FROM fm_freelancers WHERE clerk_id = $1", [otherClerkId.trim()]),
  ]);
  const clientId = clientRow.rows[0]?.id;
  const freelancerId = freelancerRow.rows[0]?.id;

  if (!clientId) {
    return Response.json({ error: "Only clients can start conversations with freelancers" }, { status: 403 });
  }
  if (!freelancerId) {
    return Response.json({ error: "Freelancer not found" }, { status: 404 });
  }

  const existing = await db.query(
    "SELECT id FROM fm_conversations WHERE client_id = $1 AND freelancer_id = $2",
    [clientId, freelancerId]
  );
  if (existing.rows[0]) {
    const channelSlug = "dm-" + [userId, otherClerkId.trim()].sort().join("-");
    return Response.json({ channelSlug });
  }

  await db.query(
    "INSERT INTO fm_conversations (client_id, freelancer_id) VALUES ($1, $2)",
    [clientId, freelancerId]
  );
  const channelSlug = "dm-" + [userId, otherClerkId.trim()].sort().join("-");
  return Response.json({ channelSlug });
};
