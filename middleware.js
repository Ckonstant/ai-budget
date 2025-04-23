import { clerkMiddleware } from "@clerk/nextjs/server";
 
// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
export default clerkMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: [
    "/",
    "/sign-in", 
    "/sign-up", 
    "/api/webhook(.*)",
    "/images/(.*)"
  ],
  
  // Routes that can always be accessed, and have no auth information
  ignoredRoutes: [
    "/_next/static/(.*)",
    "/_next/image(.*)",
    "/favicon.ico",
    "/api/inngest(.*)"
  ],
  
  debug: true, // Set to true for more logging during development
});
 
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};