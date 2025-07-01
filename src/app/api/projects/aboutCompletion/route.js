import { NextResponse } from "next/server";
import connectDb from "@/db/mongoose";
import Questionnaire from "@/models/question.model";
import { getAuth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await connectDb();
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required." }, { status: 400 });
    }

    // Find all questionnaires for this user
    const questionnaires = await Questionnaire.find({ userId });

    // Track if each section has at least one answered question
    const requiredSections = ["about", "audience", "brand"];
    const sectionFilled = {
      about: false,
      audience: false,
      brand: false,
    };

    for (const q of questionnaires) {
      for (const section of q.sections || []) {
        if (
          requiredSections.includes(section.section) &&
          section.questions &&
          section.questions.some(
            (ques) => ques.answer && typeof ques.answer === "string" && ques.answer.trim() !== ""
          )
        ) {
          sectionFilled[section.section] = true;
        }
      }
    }

    // Only complete if all three sections have at least one answered question
    const isComplete = requiredSections.every((sec) => sectionFilled[sec]);

    return NextResponse.json({ success: true, complete: isComplete });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}