import { NextResponse } from "next/server";
import connectDb from "@/db/mongoose";
import DeletionRequest from "@/models/deletionRequest.model";

export async function POST(req) {
  await connectDb();

  const body = await req.json();
  const { userId, email } = body;

  // Store deletion request in DB
  await DeletionRequest.create({
    userId,
    email,
    status: "pending",
  });

  return NextResponse.json({ success: true });
}