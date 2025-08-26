
// app/profile/[username]/page.js
import Profile from "@/components/Profile";
import connectDb from "@/db/mongoose";
import Questionnaire from "@/models/question.model";
import ProjectDraft from "@/models/project.model";
import User from "@/models/user.model";
import { currentUser } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  await connectDb();

  // ✅ Correct usage
  const user = await currentUser();
  console.log("👉 Clerk currentUser:", user);

  if (!user) {
    return <div>User not authenticated</div>;
  }

  const userId = user.id;

  // ===== Portfolio check (from ProjectDraft) =====
  const draft = await ProjectDraft.findOne({ userId });
  let filledCount = 0;
  if (draft) {
    const filledInstagram = (draft.instagramSelected || []).filter(
      (p) => p.isDraft === false
    );
    const filledUploaded = (draft.uploadedFiles || []).filter(
      (p) => p.isDraft === false
    );
    filledCount = filledInstagram.length + filledUploaded.length;
  }
  const portfolioComplete = filledCount >= 4;

  // ===== Questionnaire check (about + audience) =====
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

  // ===== Instagram check (from User) =====
  const User1 = await User.findOne({ userId });
  const instaConnected = !!(
    User1?.instagramAccessToken && User1?.instagramAccountId
  );

  return (
    <Profile
      portfolioComplete={portfolioComplete}
      aboutComplete={isComplete}
      audienceComplete={instaConnected}
    />
  );
}
