

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/clerk-sdk-node";

const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/signup(.*)",
  "/api/auth/refreshInstagram",
  "/privacy-policy",
  "/terms-and-services",
  "/api/public-portfolio/posts",
  "/api/public-portfolio/questions",
  "/api/public-portfolio/audience/allDemographics",
  "/api/public-portfolio/audience/cityDemographics",
  "/api/public-portfolio/audience/countryDemographics",
  "/api/public-portfolio/audience/femaleDemographics",
  "/api/public-portfolio/audience/genderDemographics",
  "/api/public-portfolio/audience/maleDemographics",
  "/api/public-portfolio/preview",
  "/api/public-portfolio/media-insights",
  "/api/public-portfolio/instagram-stats",
  "/request-popup",
  "/api/send-email",
  "/:username/media-kit",
  "/:username/media-kit/post",
  "/onboarding/loading",
  "/:username/media-kit/loading(.*)" ,
  "/api/public-portfolio/userinfo(.*)",
]);

export default clerkMiddleware(async (authFn, request) => {
  const auth = await authFn(); 
  const { sessionId, userId } = auth;
  console.log("Session ID:", sessionId);
  console.log("User ID:", userId);

  const url = new URL(request.url); 
  const isAdminRoute = url.pathname.includes('/adminview');
  const isDashboardRoute = url.pathname === "/dashboard";
    // ⚠️ Only fetch Clerk user if authenticated
  let hasCompletedOnboarding = false;
  let username = null;


  // Extract Clerk metadata (added during onboarding)
  if (userId) {
    const user = await clerkClient.users.getUser(userId);
    hasCompletedOnboarding = user.publicMetadata?.hasCompletedOnboarding;
    username = user.publicMetadata?.username;
  }


  // If it's an admin route and user is not authenticated, redirect to signup
  if (isAdminRoute && !sessionId) {
    const redirectUrl = new URL("/signup", request.url);
    return NextResponse.redirect(redirectUrl);
  }
  // If user is logged in -> base url enter
  if (sessionId) {
    if (url.pathname === "/") {
      if (hasCompletedOnboarding && username) {
        return NextResponse.redirect(new URL(`/dashboard/${username}`, request.url));
      } else {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }
    }
    //case 2: login page enter with no onboarding 
    if (isDashboardRoute) {
      if (hasCompletedOnboarding && username) {
        return NextResponse.redirect(new URL(`/dashboard/${username}`, request.url));
      } else {
        return NextResponse.redirect(new URL("/onboarding/step-1", request.url));
      }
    }
  }

   // Redirect unauthenticated users trying to access private routes
  if (!isPublicRoute(request) && !sessionId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};


// Starting October 8, 2024, the Node SDK is entering a three-month notice period. We encourage everyone to migrate to @clerk/express. For full details, please see our changelog: https://clerk.com/changelog/2024-10-08-express-sdk