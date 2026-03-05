import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublic = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/pay/(.*)",             // public payment page
  "/i/(.*)",               // public invoice view (optional)
  "/api/webhooks/(.*)",    // Paystack, bank-transfer, etc.
  "/manifest.json",        // PWA manifest (must be public to load)
  "/sw.js",                // PWA service worker
  "/icon-192.png",
  "/icon-512.png",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublic(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
