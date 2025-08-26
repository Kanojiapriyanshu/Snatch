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

    const { section, questions } = await req.json();
    if (!section || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
    }

    // Find or create the questionnaire
    let userQuestionnaire = await Questionnaire.findOne({ userId });

    if (!userQuestionnaire) {
      userQuestionnaire = new Questionnaire({
        userId,
        sections: [{ section, questions }],
      });
    } else {
      if (!userQuestionnaire.sections) {
        userQuestionnaire.sections = [];
      }

      const sectionIndex = userQuestionnaire.sections.findIndex(
        (s) => s.section === section
      );

      if (sectionIndex !== -1) {
        // 🚀 overwrite the entire section’s questions
        userQuestionnaire.sections[sectionIndex].questions = questions;
      } else {
        // add a new section if missing
        userQuestionnaire.sections.push({ section, questions });
      }
    }

    await userQuestionnaire.save();

    return NextResponse.json(
      { message: "Questionnaire saved successfully!", userQuestionnaire },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving questionnaire:", error);
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
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
