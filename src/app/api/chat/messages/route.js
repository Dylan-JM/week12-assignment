import { auth } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/dbConnection";

// Find conversation id by the two participants’ clerk ids (order-independent).
const CONV_QUERY = `SELECT c.id FROM fm_conversations c
  JOIN fm_clients cl ON cl.id = c.client_id
  JOIN fm_freelancers f ON f.id = c.freelancer_id
  WHERE (cl.clerk_id = $1 AND f.clerk_id = $2) OR (cl.clerk_id = $2 AND f.clerk_id = $1)`;

// Parse "dm-{clerkId1}-{clerkId2}" into [clerkId1, clerkId2] or null.
function parseChannelSlug(slug) {
  if (!slug?.startsWith("dm-")) return null;
  const parts = slug.slice(3).split("-");
  return parts.length === 2 && parts[0] && parts[1] ? parts : null;
}

// Return existing conversation id for two clerk ids, or null.
async function getConversationId(clerkIds) {
  const { rows } = await db.query(CONV_QUERY, [clerkIds[0], clerkIds[1]]);
  return rows[0]?.id ?? null;
}

// Return conversation id for two clerk ids; create conversation if missing.
async function getOrCreateConversationId(clerkIds) {
  let conv = await db.query(CONV_QUERY, [clerkIds[0], clerkIds[1]]);
  if (conv.rows[0]) return conv.rows[0].id;
  // Resolve client and freelancer ids by clerk id.
  const [clientRow, freelancerRow] = await Promise.all([
    db.query(`SELECT id FROM fm_clients WHERE clerk_id = ANY($1)`, [clerkIds]),
    db.query(`SELECT id FROM fm_freelancers WHERE clerk_id = ANY($1)`, [clerkIds]),
  ]);
  const clientId = clientRow.rows[0]?.id;
  const freelancerId = freelancerRow.rows[0]?.id;
  if (!clientId || !freelancerId) return null;
  // Create new conversation.
  const insert = await db.query(
    `INSERT INTO fm_conversations (client_id, freelancer_id) VALUES ($1, $2) RETURNING id`,
    [clientId, freelancerId],
  );
  return insert.rows[0].id;
}

// Parse message content (plain text or JSON proposal/accepted/denied/file) into a normalized data object.
function parseMessageContent(content) {
  const out = {
    text: content,
    proposalJobId: null,
    messageType: null,
    acceptedJobId: null,
    deniedJobId: null,
    jobTitle: null,
    startDate: null,
    endDate: null,
    fileUrl: null,
    fileName: null,
  };
  try {
    const p = JSON.parse(content);
    if (p?.type === "proposal") {
      out.text = p.text ?? content;
      out.proposalJobId = p.jobId ?? null;
      out.messageType = "proposal";
    } else if (p?.type === "proposal_accepted") {
      out.text = p.text ?? "Proposal accepted";
      out.messageType = "proposal_accepted";
      out.acceptedJobId = p.jobId ?? null;
      out.jobTitle = p.jobTitle ?? null;
      out.startDate = p.startDate ?? null;
      out.endDate = p.endDate ?? null;
    } else if (p?.type === "proposal_denied") {
      out.text = p.text ?? "Proposal denied";
      out.messageType = "proposal_denied";
      out.deniedJobId = p.jobId ?? null;
    } else if (p?.type === "file") {
      out.text = p.fileName ?? "File";
      out.messageType = "file";
      out.fileUrl = p.fileUrl ?? null;
      out.fileName = p.fileName ?? null;
    }
  } catch {}
  return out;
}

// Fetch avatar image URLs from Clerk for the given clerk user ids.
async function fetchAvatarUrls(clerkIds) {
  const ids = [...new Set(clerkIds.map((id) => String(id).trim()).filter(Boolean))];
  if (!ids.length) return {};
  try {
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    const results = await Promise.allSettled(
      ids.map((id) => clerk.users.getUser(id).then((u) => ({ id, url: u.imageUrl }))),
    );
    return Object.fromEntries(
      ids.map((id, i) => [id, results[i].status === "fulfilled" ? results[i].value?.url : null]).filter(([, u]) => u),
    );
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

  const conversationId = await getConversationId(clerkIds);
  if (!conversationId) return Response.json({ messages: [] });

  // List messages for the conversation, oldest first.
  const { rows } = await db.query(
    `SELECT id, sender_id, content, created_at FROM fm_messages WHERE conversation_id = $1 ORDER BY created_at ASC`,
    [conversationId],
  );
  const avatars = await fetchAvatarUrls(rows.map((m) => m.sender_id));

  const messages = rows.map((m) => {
    const sid = String(m.sender_id ?? "").trim();
    const data = parseMessageContent(m.content);
    return {
      id: m.id,
      name: "ADD",
      data: { ...data, avatarUrl: avatars[sid] ?? null, senderId: sid },
      timestamp: m.created_at,
    };
  });
  return Response.json({ messages });
};

export const POST = async (request) => {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid JSON" }, { status: 400 });
  const { channel, content } = body;
  if (!channel || content == null) {
    return Response.json({ error: "channel and content required" }, { status: 400 });
  }

  const clerkIds = parseChannelSlug(channel);
  if (!clerkIds) return Response.json({ error: "Invalid channel" }, { status: 400 });

  const conversationId = await getOrCreateConversationId(clerkIds);
  if (!conversationId) return Response.json({ error: "Client or freelancer not found" }, { status: 404 });

  // Insert new message.
  await db.query(
    `INSERT INTO fm_messages (conversation_id, sender_id, content) VALUES ($1, $2, $3)`,
    [conversationId, userId, String(content)],
  );
  return Response.json({ ok: true });
};
