//src/middleware.js
// src/middleware.js
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

// Explicitly define public routes
const PUBLIC_ROUTES = [
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
];

function isPublicRoute(pathname) {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  const authState = auth();
  const { isLoaded, userId, sessionId } = authState;
  console.log("Session ID:", sessionId);
  console.log("User ID:", userId);

  // 1️⃣ Allow Inngest API completely
  if (pathname.startsWith("/api/inngest")) return NextResponse.next();

  // 2️⃣ Wait for Clerk to load for private routes
  const isPrivateRoute = !isPublicRoute(pathname);
  if (!isLoaded && isPrivateRoute) return NextResponse.next();

  // 3️⃣ Handle homepage "/"
  if (pathname === "/") {
    if (userId) {
      // Logged-in user -> redirect to dashboard or onboarding
      const user = await clerkClient.users.getUser(userId);
      const hasCompletedOnboarding = user.publicMetadata?.hasCompletedOnboarding;
      const username = user.publicMetadata?.username;

      return NextResponse.redirect(
        new URL(
          hasCompletedOnboarding && username
            ? `/dashboard/${username}`
            : "/onboarding/step-1",
          request.url
        )
      );
    }
    // Non-logged-in -> allow
    return NextResponse.next();
  }

  // 4️⃣ Protect private routes
  if (isPrivateRoute && !sessionId) {
    // Non-logged-in user trying to access protected page
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 5️⃣ Logged-in users accessing private routes
  if (userId && sessionId) {
    const user = await clerkClient.users.getUser(userId);
    const hasCompletedOnboarding = user.publicMetadata?.hasCompletedOnboarding;

    // Prevent skipping onboarding for dashboard
    if (pathname.startsWith("/dashboard") && !hasCompletedOnboarding) {
      return NextResponse.redirect(new URL("/onboarding/step-1", request.url));
    }

    // Otherwise allow access
    return NextResponse.next();
  }

  // 6️⃣ For all other public routes
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!.*\\..*|_next/static|_next/image|favicon.ico).*)",
    "/",
    "/(api|trpc)(.*)"
  ],
};

// export const config = {
//   matcher: [
//     "/((?!.*\\..*|_next).*)",
//     "/",
//     "/(api|trpc)(.*)",
//   ],
// };

// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";
// import { clerkClient } from "@clerk/nextjs/server";

// const isPublicRoute = createRouteMatcher([
//   "/",
//   "/login(.*)",
//   "/signup(.*)",
//   "/not-found",
//   "/(.*)/media-kit/not-found",
//   "/api/auth/refreshInstagram",
//   "/privacy-policy",
//   "/terms-and-services",
//   "/api/public-portfolio/posts",
//   "/api/public-portfolio/questions",
//   "/api/public-portfolio/audience/allDemographics",
//   "/api/public-portfolio/audience/cityDemographics",
//   "/api/public-portfolio/audience/countryDemographics",
//   "/api/public-portfolio/audience/femaleDemographics",
//   "/api/public-portfolio/audience/genderDemographics",
//   "/api/public-portfolio/audience/maleDemographics",
//   "/api/public-portfolio/preview",
//   "/api/public-portfolio/media-insights",
//   "/api/public-portfolio/instagram-stats",
//   "/request-popup",
//   "/api/send-email",
//   "/:username/media-kit",
//   "/:username/media-kit/post",
//   "/onboarding/loading",
//   "/:username/media-kit/loading(.*)" ,
//   "/api/public-portfolio/userinfo(.*)",
//   "/api/og/:username", 
//   "/api/inngest(.*)",
//   "/api/user/public/user-plan(.*)",
// ]);

// export default clerkMiddleware(async (auth, request) => {
//   const { pathname } = request.nextUrl;

//   // Always allow Inngest
//   if (pathname.startsWith("/api/inngest")) {
//     return NextResponse.next();
//   }

//   const authState = auth();
//   const { userId } = authState;

//   // Special handling for homepage - check if user is logged in
//   if (pathname === "/") {
//     if (userId) {
//       // Logged-in user on homepage - get their info and redirect
//       const user = await clerkClient.users.getUser(userId);
//       const hasCompletedOnboarding = user.publicMetadata?.hasCompletedOnboarding;
//       const username = user.publicMetadata?.username;

//       return NextResponse.redirect(
//         new URL(
//           hasCompletedOnboarding && username
//             ? `/dashboard/${username}`
//             : "/onboarding/step-1",
//           request.url
//         )
//       );
//     }
//     // Non-logged-in user on homepage - allow access
//     return NextResponse.next();
//   }

//   // Check if route is public (excluding homepage which we handled above)
//   if (isPublicRoute(request)) {
//     return NextResponse.next();
//   }

//   // If we get here, it's a private route - require authentication
//   if (!userId) {
//     return NextResponse.redirect(new URL("/", request.url));
//   }

//   // Get user metadata for logged-in users accessing private routes
//   const user = await clerkClient.users.getUser(userId);
//   const hasCompletedOnboarding = user.publicMetadata?.hasCompletedOnboarding;
//   const isDashboardRoute = pathname.startsWith("/dashboard");

//   // Prevent skipping onboarding
//   if (isDashboardRoute && !hasCompletedOnboarding) {
//     return NextResponse.redirect(new URL("/onboarding/step-1", request.url));
//   }

//   return NextResponse.next();
// });

// export const config = {
//   matcher: [
//     "/((?!.*\\..*|_next).*)",
//     "/",
//     "/(api|trpc)(.*)",
//   ],
// };
 
// export default clerkMiddleware(async (auth, request) => {
//   const { pathname } = request.nextUrl;

//   // ✅ 1. LET INNGEST PASS COMPLETELY
//   if (pathname.startsWith("/api/inngest")) {
//     return NextResponse.next();
//   }

//   const { userId, sessionId } = auth();

//   let hasCompletedOnboarding = false;
//   let username = null;

//   if (userId) {
//     const user = await clerkClient.users.getUser(userId);
//     hasCompletedOnboarding = user.publicMetadata?.hasCompletedOnboarding;
//     username = user.publicMetadata?.username;
//   }

//   const isDashboardRoute = pathname.startsWith("/dashboard");

//   // Logged-in user on /
//   if (sessionId && pathname === "/") {
//     return NextResponse.redirect(
//       new URL(
//         hasCompletedOnboarding && username
//           ? `/dashboard/${username}`
//           : "/onboarding",
//         request.url
//       )
//     );
//   }

//   // Dashboard access
//   if (sessionId && isDashboardRoute && !hasCompletedOnboarding) {
//     return NextResponse.redirect(
//       new URL("/onboarding/step-1", request.url)
//     );
//   }

//   // Protect private routes
//   if (!isPublicRoute(request) && !sessionId) {
//     return NextResponse.redirect(new URL("/", request.url));
//   }

//   return NextResponse.next();
// });


// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";
// import { clerkClient } from "@clerk/clerk-sdk-node";


// export default clerkMiddleware(async (authFn, request) => {
//   const auth = await authFn(); 
//   const { sessionId, userId } = auth;
//   console.log("Session ID:", sessionId);
//   console.log("User ID:", userId);

//   const url = new URL(request.url); 
//   const isAdminRoute = url.pathname.includes('/adminview');
//   const isDashboardRoute = url.pathname === "/dashboard";
//     // ⚠️ Only fetch Clerk user if authenticated
//   let hasCompletedOnboarding = false;
//   let username = null;


//   // Extract Clerk metadata (added during onboarding)
//   if (userId) {
//     const user = await clerkClient.users.getUser(userId);
//     hasCompletedOnboarding = user.publicMetadata?.hasCompletedOnboarding;
//     username = user.publicMetadata?.username;
//   }


//   // If it's an admin route and user is not authenticated, redirect to signup
//   if (isAdminRoute && !sessionId) {
//     const redirectUrl = new URL("/signup", request.url);
//     return NextResponse.redirect(redirectUrl);
//   }
//   // If user is logged in -> base url enter
//   if (sessionId) {
//     if (url.pathname === "/") {
//       if (hasCompletedOnboarding && username) {
//         return NextResponse.redirect(new URL(`/dashboard/${username}`, request.url));
//       } else {
//         return NextResponse.redirect(new URL("/onboarding", request.url));
//       }
//     }
//     //case 2: login page enter with no onboarding 
//     if (isDashboardRoute) {
//       if (hasCompletedOnboarding && username) {
//         return NextResponse.redirect(new URL(`/dashboard/${username}`, request.url));
//       } else {
//         return NextResponse.redirect(new URL("/onboarding/step-1", request.url));
//       }
//     }
//   }

//    // Redirect unauthenticated users trying to access private routes
//   if (!isPublicRoute(request) && !sessionId) {
//     return NextResponse.redirect(new URL("/", request.url));
//   }

//   return NextResponse.next();
// });

// export const config = {
//    matcher: [
//      // Skip static files & public assets completely
//     "/((?!_next/static|_next/image|_next|favicon.ico|assets/|.*\\..*|api/inngest|api/inngest/.*).*)",
//   ],
// };

   // "/((?!_next/static|_next/image|favicon.ico|api/inngest|api/inngest/.*|api/webhooks/.*).*)",
  // matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
  //matcher : ["/((?!_next/static|_next/image|api/inngest|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],

// Starting October 8, 2024, the Node SDK is entering a three-month notice period. We encourage everyone to migrate to @clerk/express. For full details, please see our changelog: https://clerk.com/changelog/2024-10-08-express-sdk

// "/((?!_next/static|_next/image|favicon.ico|assets|.*\\.(png|jpg|jpeg|svg|gif|ico|webp)|api/inngest|api/inngest/.*).*)",
    //  "/((?!_next/static|_next/image|favicon.ico|api/inngest|api/inngest/.*).*)",