import { auth } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/dbConnection";
import { supabase } from "@/lib/supabaseServer";
import Ably from "ably";

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

// Return conversation id for two clerk ids; create conversation if missing.
async function getOrCreateConversationId(clerkIds) {
  let conv = await db.query(CONV_QUERY, [clerkIds[0], clerkIds[1]]);
  if (conv.rows[0]) return conv.rows[0].id;
  // Resolve client and freelancer ids by clerk id.
  const [clientRow, freelancerRow] = await Promise.all([
    db.query(`SELECT id FROM fm_clients WHERE clerk_id = ANY($1)`, [clerkIds]),
    db.query(`SELECT id FROM fm_freelancers WHERE clerk_id = ANY($1)`, [
      clerkIds,
    ]),
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

const BUCKET = process.env.SUPABASE_CHAT_BUCKET;

export const POST = async (request) => {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const channel = formData.get("channel");
  const file = formData.get("file");
  const clerkIds = parseChannelSlug(channel);
  const conversationId = await getOrCreateConversationId(clerkIds);

  if (!supabase) {
    return Response.json(
      { error: "Storage not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." },
      { status: 503 },
    );
  }

  const bucket = BUCKET || "invoices";
  const fileName = (file.name || "document.pdf").replace(
    /[^a-zA-Z0-9._-]/g,
    "_",
  );
  const path = `${conversationId}/${Date.now()}-${fileName}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: "application/pdf",
    upsert: false,
  });
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
  const fileUrl = urlData?.publicUrl ?? null;

  const content = JSON.stringify({ type: "file", fileUrl, fileName, path });
  // Insert file message.
  const msgRow = await db.query(
    `INSERT INTO fm_messages (conversation_id, sender_id, content) VALUES ($1, $2, $3) RETURNING id`,
    [conversationId, userId, content],
  );
  const messageId = msgRow.rows[0].id;

  let avatarUrl = null;
  try {
    const user = await createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    }).users.getUser(userId);
    avatarUrl = user?.imageUrl ?? null;
  } catch {}

  const apiKey = process.env.NEXT_PUBLIC_ABLY_API_KEY;
  if (apiKey) {
    try {
      await new Ably.Rest(apiKey).channels
        .get("chat:" + channel)
        .publish("ADD", {
          id: messageId,
          text: fileName,
          messageType: "file",
          fileUrl,
          fileName,
          senderId: userId,
          avatarUrl,
        });
    } catch {}
  }

  return Response.json({ ok: true, messageId, fileUrl });
};
