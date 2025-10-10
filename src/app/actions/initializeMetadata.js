// /actions/initializeMetadata.js
"use server";
import { clerkClient } from "@clerk/nextjs/server";

export async function initializeUserMetadata(userId) {
  if (!userId) return;
  return clerkClient.users.updateUser(userId, {
    publicMetadata: {
      hasCompletedOnboarding: false,
      username: null,
    },
  });
}
