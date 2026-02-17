import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/dbConnection";
import { supabase } from "@/lib/supabaseServer";

const BUCKET = process.env.SUPABASE_CHAT_BUCKET || "invoices";

// Serve a signed URL for a file message so the bucket can stay private.
export const GET = async (request) => {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const messageId = new URL(request.url).searchParams.get("messageId");
  if (!messageId) return Response.json({ error: "messageId required" }, { status: 400 });

  if (!supabase) return Response.json({ error: "Storage not configured" }, { status: 503 });

  const msgRow = await db.query(
    `SELECT conversation_id, content FROM fm_messages WHERE id = $1`,
    [messageId],
  );
  const msg = msgRow.rows[0];
  if (!msg) return Response.json({ error: "Message not found" }, { status: 404 });

  const convRow = await db.query(
    `SELECT cl.clerk_id AS client_clerk_id, f.clerk_id AS freelancer_clerk_id
     FROM fm_conversations c
     JOIN fm_clients cl ON cl.id = c.client_id
     JOIN fm_freelancers f ON f.id = c.freelancer_id
     WHERE c.id = $1`,
    [msg.conversation_id],
  );
  const conv = convRow.rows[0];
  if (!conv) return Response.json({ error: "Conversation not found" }, { status: 404 });

  const participantIds = [conv.client_clerk_id, conv.freelancer_clerk_id].filter(Boolean);
  if (!participantIds.includes(userId)) {
    return Response.json({ error: "Not in this conversation" }, { status: 403 });
  }

  let path = null;
  let fileUrl = null;
  try {
    const content = JSON.parse(msg.content);
    if (content?.type === "file") {
      path = content.path ?? null;
      fileUrl = content.fileUrl ?? null;
    }
  } catch {}

  if (path) {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60);
    if (!error && data?.signedUrl) {
      return Response.redirect(data.signedUrl);
    }
  }

  if (fileUrl) return Response.redirect(fileUrl);
  return Response.json({ error: "File not found" }, { status: 404 });
};
