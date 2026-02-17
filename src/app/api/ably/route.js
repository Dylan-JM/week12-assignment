import { currentUser } from "@clerk/nextjs/server";
import { SignJWT } from "jose";

const createToken = (clientId, apiKey, claim, capability) => {
  const [appId, signingKey] = apiKey.split(":", 2);
  const enc = new TextEncoder();
  const token = new SignJWT({
    "x-ably-capability": JSON.stringify(capability),
    "x-ably-clientId": clientId,
    "ably.channel.*": JSON.stringify(claim),
  })
    .setProtectedHeader({ kid: appId, alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(enc.encode(signingKey));
  return token;
};

const generateCapability = () => ({
  "chat:*": ["subscribe", "publish", "presence", "history"],
});

export const GET = async () => {
  const user = await currentUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.NEXT_PUBLIC_ABLY_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Server misconfiguration: Ably key missing" },
      { status: 503 },
    );
  }

  const userClaim = user.publicMetadata ?? {};
  const userCapability = generateCapability();

  const token = await createToken(user.id, apiKey, userClaim, userCapability);

  return Response.json(token);
};
