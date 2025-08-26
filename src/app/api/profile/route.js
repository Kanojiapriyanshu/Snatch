import { NextResponse } from "next/server";
import connectDb from "@/db/mongoose";
import Questionnaire from "@/models/question.model";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(req) {
  try {
    await connectDb();
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required." }, { status: 400 });
    }


    const {section, questions } = await req.json();

    if (!userId || !section || !questions) {
      return NextResponse.json(
        { error: "userId, section, and questions are required" },
        { status: 400 }
      );
    }

    const normalizedSection = section.toLowerCase();

    let userQuestionnaire = await Questionnaire.findOne({ userId });

    if (!userQuestionnaire) {
      // if no questionnaire exists, create one
      userQuestionnaire = new Questionnaire({
        userId,
        sections: [{ section: normalizedSection, questions }],
      });
    } else {
      if (!userQuestionnaire.sections) {
        userQuestionnaire.sections = [];
      }

      const sectionIndex = userQuestionnaire.sections.findIndex(
        (s) => s.section.toLowerCase() === normalizedSection
      );

      if (sectionIndex !== -1) {
        // overwrite questions if section already exists
        userQuestionnaire.sections[sectionIndex].questions = questions;
      } else {
        // push new section if it doesn’t exist yet
        userQuestionnaire.sections.push({
          section: normalizedSection,
          questions,
        });
      }
    }

    await userQuestionnaire.save();

    return NextResponse.json({
      message: "Questionnaire updated successfully",
      data: userQuestionnaire,
    });
  } catch (err) {
    console.error("Error saving questionnaire:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await connectDb();
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required." },
        { status: 400 }
      );
    }

    const questionnaire = await Questionnaire.findOne({ userId });

    if (!questionnaire) {
      return NextResponse.json(
        { error: "No questionnaire found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { questionnaires: [questionnaire] },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving profile data:", error);
    return NextResponse.json(
      { error: "Failed to retrieve data" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    await connectDb();
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required." },
        { status: 400 }
      );
    }

    const { section, questionId } = await req.json();

    if (!section || questionId === undefined) {
      return NextResponse.json(
        { error: "Section and questionId are required." },
        { status: 400 }
      );
    }

    const questionnaire = await Questionnaire.findOne({ userId });
    if (!questionnaire) {
      return NextResponse.json(
        { error: "Questionnaire not found." },
        { status: 404 }
      );
    }

    const sectionData = questionnaire.sections.find((s) => s.section === section);
    if (!sectionData) {
      return NextResponse.json({ error: "Section not found." }, { status: 404 });
    }

    let removedQuestion = null;

    // Try index-based removal
    if (!isNaN(questionId)) {
      const index = parseInt(questionId, 10);
      if (index >= 0 && index < sectionData.questions.length) {
        removedQuestion = sectionData.questions.splice(index, 1)[0];
      }
    } else {
      // Try ObjectId-based removal
      const idx = sectionData.questions.findIndex(
        (q) => q._id?.toString() === questionId.toString()
      );
      if (idx !== -1) {
        removedQuestion = sectionData.questions.splice(idx, 1)[0];
      }
    }

    if (!removedQuestion) {
      return NextResponse.json(
        { error: "Question not found in section." },
        { status: 404 }
      );
    }

    await questionnaire.save();

    return NextResponse.json(
      {
        message: "Question deleted successfully",
        deletedFromSection: section,
        deletedQuestion: removedQuestion,
        remainingQuestions: sectionData.questions.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { error: "Failed to delete question", details: error.message },
      { status: 500 }
    );
  }
}
