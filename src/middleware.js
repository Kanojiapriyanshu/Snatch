//src/middleware.js
import {
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
 "/",
  "/login(.*)",
  "/signup(.*)",
  "/not-found",
  "/(.*)/media-kit/not-found",
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
  "/api/og/:username", 
  "/api/inngest(.*)",
  "/api/user/public/user-plan(.*)",
]);

export default clerkMiddleware(async (auth, req) => {

  const { userId } = await auth();
  const { pathname } = req.nextUrl;

  // 🚫 Not logged in + private route → go to homepage
  if (!userId && !isPublicRoute(req)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  // matcher: [
  //   "/((?!_next|.*\\..*).*)",
  //   "/(api|trpc)(.*)",
  // ],
    matcher: [
    // match all pages except static files
    "/((?!_next|.*\\..*).*)",

    // match all API routes in App Router explicitly
    "/api/(.*)",
  ],
};

