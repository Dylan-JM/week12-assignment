import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectdRoute = createRouteMatcher([
  "/freelancer/(.*)",
  "/client/(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const path = req.nextUrl.pathname;
  if (path === "/freelancer/plans" || path.startsWith("/freelancer/plans/")) {
    return;
  }
  if (isProtectdRoute(req)) await auth.protect();
});
