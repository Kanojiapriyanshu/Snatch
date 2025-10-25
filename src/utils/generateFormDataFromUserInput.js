import { GoogleGenerativeAI } from "@google/generative-ai";

// Load both keys from .env
const GEMINI_KEYS = [
  process.env.NEXT_PUBLIC_GEMINI_API_KEY_1,
  process.env.NEXT_PUBLIC_GEMINI_API_KEY_2,
].filter(Boolean); // removes undefined keys

export const generateFormDataFromUserInput = async (userInput, isBrandCollaboration) => {

  if (!GEMINI_KEYS.length) {
    throw new Error("No Gemini API keys configured");
  }

  const basePrompt = `

You are an AI assistant that helps creators write polished, press kit–ready entries to showcase brand collaborations. Your job is to extract structured data from a casual description and rewrite it clearly and persuasively for a brand-facing audience.

---

🎯 PURPOSE:
This entry will appear on a public-facing press kit viewed by brand managers, agencies, and marketers. The goal is to showcase the creator's role, creativity, and credibility in a way that feels confident, polished, and real.

The brand collaboration is this:
is_brand_collaboration = ${isBrandCollaboration}

---

🗣️ TONE & STYLE:
- Professional but fresh — confident, punchy, and editorial
- Write in third person but avoid saying “the creator” — instead, imply the role naturally (e.g. "Created content...", "Led a session...", not "The creator did...")
- Hook the reader: titles should be active, specific, and creator-led — not brand-first
- Use sentence case — use proper punctuation and grammar
- Avoid robotic or generic phrases like “collaborated with” or “boosted visibility”
- Avoid duplicating the same highlight in both title and description
- Descriptions should feel like mini case studies: what the creator did, how, and why it mattered

---

🧠 INSTRUCTIONS:
- Use only the user’s input (do not invent details)
- If fields are missing, vague, or unclear, make your best draft and flag it for confirmation
- Add a human-readable suggestion as part of the flagged field if needed:
  - e.g. "Newme product launch (could you name the campaign or product?)"
  - e.g. "India (which city did this take place in?)"
- For industries, select only those that are clearly relevant based on:
  - What the company is known for (e.g. dating → relationships, not tech)
  - What the creator did (not marketing or digital marketing) (e.g. content creation in beauty → Beauty)
  - The context/theme of the event (e.g. a mental health livestream → Wellness)
- Do not default to “Digital Marketing”, "E-commerce" or “Marketing” unless explicitly clear
- Prioritize clarity and insight: always include what the creator did, where, and their role
- Keep event names and titles natural and memorable — avoid robotic or placeholder-y phrasing like “latest drop” or “new product launch” without a specific angle
- While answering all questions ensure to use sentence case and correct grammar
- If any field value starts with “considerations:”, remove the prefix 

Use the variable is_brand_collaboration to decide which fields to extract and display.
Decide whether this project is a brand collaboration based on the user's input.
If it involves a brand, company, product promotion, sponsorship, paid partnership, or campaign — set:

- If is_brand_collaboration = true:
  → Extract and display all fields, including:
    - company_name
    - company_location
    - event_name
    - event_type
    
If it is a personal, editorial, community-led, or non-commercial project — set:
- is_brand_collaboration = false:
  → Skip the following fields entirely:
    - company_name
    - company_location
    - event_name
    - event_type
  → Do NOT include them in the JSON at all


This boolean will also be used to control the UI toggle for "Is this a brand collaboration?" — set it to match your best judgment.
Always include is_brand_collaboration in the final JSON output.


---

📦 OUTPUT FORMAT (JSON):

{
  "is_brand_collaboration": true // or false
  "title":  "string — sentence-case headline showing the creator’s impact (max 10 words)",
  "description": "string — Capitalize the first letter of each sentence and use sentence-case and proper grammar and punctuation to give a summary of the creator’s role and value (min 20 words and max 25 words)",
  "industries": ["string", "string"], - Do not default to “Digital Marketing”, "E-commerce", "Social Media" or “Marketing” unless explicitly clear

  // Include these ONLY if it's a brand collaboration otherwise:
  "companyName": "string",
  "companyLocation": "string",
  "eventTypes": "string",
  "eventName": "string" - use title case, 

   // When unsure about any field, add the following considerations. Do not mention "considerations" prefix - only add the actual questions
   // If a field is missing, vague, or unclear, leave its value empty ("") and add a clarifying message in the considerations object for that field. Do not put clarifying questions or suggestions as the value of the field itself. Only for eventName as per the userinput given by user also have a name decided.
  considerations: {
    "title": "Could this headline highlight the creator's skill or result more clearly?",
    "description": "Does the description show what was done and why it mattered?",
    "eventName": "Could you name the campaign, drop, or event more specifically?",
    "companyLocation": "Which city did this happen in?",
    "industries": "Are these the most relevant tags based on what you did?"
  }
}


Only include keys inside considerations that actually need user review. You may omit others.

---

✅ APPROVED EVENT TYPES:
"Conference", "Workshop", "Webinar", "Networking", "Product Launch", "Brand Activation", "Store Opening", "Exclusive Brand Experience", "Industry Conference", "Panel", "Livestream", "Virtual Event", "Podcast or Interview", "Workshop or Training Session"

✅ INDUSTRY TAGS (max 3, only if clearly relevant):
"Accounting", "Advertising", "Aerospace", "Agriculture", "AI & Machine Learning",
"Alternative Medicine", "Apparel", "Architecture", "Arts & Culture", "Automotive",
"Aviation", "Baking & Bakeware", "Beauty", "Biotechnology", "Blogging & Vlogging",
"Broadcasting", "Business & Finance", "Chemicals", "Clean Energy", "Climate Change",
"Comedy", "Construction", "Consumer Electronics", "Consulting", "Cooking",
"Crypto & Blockchain", "Cybersecurity", "Dance", "Design", "Digital Marketing",
"DIY & Crafts", "E-Commerce", "Education", "Entertainment", "Environment",
"Events Management", "Fashion", "Financial Services", "Fitness & Wellness",
"Food & Beverage", "Gaming & Esports", "Games & Toys", "Government", "Haircare",
"Healthcare & Medicine", "History", "Home & Decor", "Hospitality", "Human Rights",
"Insurance", "Internet & Software", "Investments", "Jewelry", "Legal Services", "Lifestyle",
"Literature", "Luxury Goods", "Makeup & Skincare", "Manufacturing", "Marketing",
"Media & Publishing", "Mental Health", "Modeling", "Music", "Nonprofit & Social Causes",
"Nutrition", "Outdoor Recreation", "Parenting & Kids", "Performing Arts", "Personal Care",
"Pets", "Philosophy", "Photography", "Psychology", "Public Relations", "Real Estate",
"Renewable Energy", "Retail", "Robotics", "Science", "Security", "Social Entrepreneurship",
"Social Impact", "Social Media", "Software Development", "Spirituality", "Sports",
"Sustainability", "Teaching & Education", "Tech & Gadgets", "Telecommunications",
"Transportation", "Travel & Tourism", "Video & Production", "Virtual Reality",
"Web Design & Development", "Wine & Spirits"

----

         ✍️ USER INPUT:
         """${userInput}"""
   `;


  // Try each Gemini API key in sequence
  for (let i = 0; i < GEMINI_KEYS.length; i++) {
    const key = GEMINI_KEYS[i];
    try {
      console.log(`🔑 Using Gemini key ${i + 1}`);

      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

      const result = await model.generateContent(basePrompt);
      const response = await result.response;
      const text = response.text();

      console.log('Raw AI response:', text); // Debug log

      // Extract JSON reliably
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsedData = JSON.parse(jsonMatch[0]);
      console.log('Parsed data:', parsedData); // Debug log
      return parsedData;

    } catch (error) {
      const msg = error?.message || error.toString();
      console.warn(`❌ Gemini key ${i + 1} failed:`, msg);

      // If quota/rate limit or model overloaded/server error → try next key
      if (
        msg.includes("429") ||
        msg.toLowerCase().includes("quota") ||
        msg.toLowerCase().includes("rate limit") ||
        msg.toLowerCase().includes("resource exhausted") ||
        msg.toLowerCase().includes("service unavailable") ||
        msg.toLowerCase().includes("too many requests") ||
        msg.toLowerCase().includes("model overloaded")
      ) {
        console.log("⚙️ Switching to next Gemini API key...");
        continue;
      }

      // Otherwise stop immediately
      throw error;
    }
  }

  // All keys failed
  throw new Error("All Gemini API keys failed. Unable to generate form data.");
};


// "is_brand_collaboration": true // or false
// n your code, when the AI response is received:
// If is_brand_collaboration === true → toggle switch ON (blue ✅ as shown)
// If false → toggle switch OFF


// export const generateFormDataFromUserInput = async (userInput, isBrandCollaboration) => {
//   console.log("AI USER INPUT FUNCTION GETTING", userInput, isBrandCollaboration);

//   if (!process.env.NEXT_PUBLIC_OPENROUTER_API_KEY) {
//     throw new Error("OpenRouter API key is not configured");
//   }

//       const basePrompt = `

// You are an AI assistant that helps creators write polished, press kit–ready entries to showcase brand collaborations. Your job is to extract structured data from a casual description and rewrite it clearly and persuasively for a brand-facing audience.

// ---

// 🎯 PURPOSE:
// This entry will appear on a public-facing press kit viewed by brand managers, agencies, and marketers. The goal is to showcase the creator's role, creativity, and credibility in a way that feels confident, polished, and real.

// The brand collaboration is this:
// is_brand_collaboration = ${isBrandCollaboration}

// ---

// 🗣️ TONE & STYLE:
// - Professional but fresh — confident, punchy, and editorial
// - Write in third person but avoid saying “the creator” — instead, imply the role naturally (e.g. "Created content...", "Led a session...", not "The creator did...")
// - Hook the reader: titles should be active, specific, and creator-led — not brand-first
// - Use sentence case — use proper punctuation and grammar
// - Avoid robotic or generic phrases like “collaborated with” or “boosted visibility”
// - Avoid duplicating the same highlight in both title and description
// - Descriptions should feel like mini case studies: what the creator did, how, and why it mattered

// ---

// 🧠 INSTRUCTIONS:
// - Use only the user’s input (do not invent details)
// - If fields are missing, vague, or unclear, make your best draft and flag it for confirmation
// - Add a human-readable suggestion as part of the flagged field if needed:
//   - e.g. "Newme product launch (could you name the campaign or product?)"
//   - e.g. "India (which city did this take place in?)"
// - For industries, select only those that are clearly relevant based on:
//   - What the company is known for (e.g. dating → relationships, not tech)
//   - What the creator did (not marketing or digital marketing) (e.g. content creation in beauty → Beauty)
//   - The context/theme of the event (e.g. a mental health livestream → Wellness)
// - Do not default to “Digital Marketing”, "E-commerce" or “Marketing” unless explicitly clear
// - Prioritize clarity and insight: always include what the creator did, where, and their role
// - Keep event names and titles natural and memorable — avoid robotic or placeholder-y phrasing like “latest drop” or “new product launch” without a specific angle
// - While answering all questions ensure to use sentence case and correct grammar
// - If any field value starts with “considerations:”, remove the prefix 

// Use the variable is_brand_collaboration to decide which fields to extract and display.
// Decide whether this project is a brand collaboration based on the user's input.
// If it involves a brand, company, product promotion, sponsorship, paid partnership, or campaign — set:

// - If is_brand_collaboration = true:
//   → Extract and display all fields, including:
//     - company_name
//     - company_location
//     - event_name
//     - event_type
    
// If it is a personal, editorial, community-led, or non-commercial project — set:
// - is_brand_collaboration = false:
//   → Skip the following fields entirely:
//     - company_name
//     - company_location
//     - event_name
//     - event_type
//   → Do NOT include them in the JSON at all


// This boolean will also be used to control the UI toggle for "Is this a brand collaboration?" — set it to match your best judgment.
// Always include is_brand_collaboration in the final JSON output.


// ---

// 📦 OUTPUT FORMAT (JSON):

// {
//   "is_brand_collaboration": true // or false
//   "title":  "string — sentence-case headline showing the creator’s impact (max 10 words)",
//   "description": "string — Capitalize the first letter of each sentence and use sentence-case and proper grammar and punctuation to give a summary of the creator’s role and value (min 20 words and max 25 words)",
//   "industries": ["string", "string"], - Do not default to “Digital Marketing”, "E-commerce", "Social Media" or “Marketing” unless explicitly clear

//   // Include these ONLY if it's a brand collaboration otherwise:
//   "companyName": "string",
//   "companyLocation": "string",
//   "eventTypes": "string",
//   "eventName": "string" - use title case, 

//    // When unsure about any field, add the following considerations. Do not mention "considerations" prefix - only add the actual questions
//    // If a field is missing, vague, or unclear, leave its value empty ("") and add a clarifying message in the considerations object for that field. Do not put clarifying questions or suggestions as the value of the field itself. Only for eventName as per the userinput given by user also have a name decided.
//   considerations: {
//     "title": "Could this headline highlight the creator's skill or result more clearly?",
//     "description": "Does the description show what was done and why it mattered?",
//     "eventName": "Could you name the campaign, drop, or event more specifically?",
//     "companyLocation": "Which city did this happen in?",
//     "industries": "Are these the most relevant tags based on what you did?"
//   }
// }


// Only include keys inside considerations that actually need user review. You may omit others.

// ---

// ✅ APPROVED EVENT TYPES:
// "Conference", "Product Launch", "Brand Promotion", "Store Opening ", "Exclusive Experience", "Virtual Event / Livestream", "Interview", "Workshop"

// ✅ INDUSTRY TAGS (max 3, only if clearly relevant):
// "Accounting", "Advertising", "Aerospace", "Agriculture", "AI & Machine Learning",
// "Alternative Medicine", "Apparel", "Architecture", "Arts & Culture", "Automotive",
// "Aviation", "Baking & Bakeware", "Beauty", "Biotechnology", "Blogging & Vlogging",
// "Broadcasting", "Business & Finance", "Chemicals", "Clean Energy", "Climate Change",
// "Comedy", "Construction", "Consumer Electronics", "Consulting", "Cooking",
// "Crypto & Blockchain", "Cybersecurity", "Dance", "Design", "Digital Marketing",
// "DIY & Crafts", "E-Commerce", "Education", "Entertainment", "Environment",
// "Events Management", "Fashion", "Financial Services", "Fitness & Wellness",
// "Food & Beverage", "Gaming & Esports", "Games & Toys", "Government", "Haircare",
// "Healthcare & Medicine", "History", "Home & Decor", "Hospitality", "Human Rights",
// "Insurance", "Internet & Software", "Investments", "Jewelry", "Legal Services", "Lifestyle",
// "Literature", "Luxury Goods", "Makeup & Skincare", "Manufacturing", "Marketing",
// "Media & Publishing", "Mental Health", "Modeling", "Music", "Nonprofit & Social Causes",
// "Nutrition", "Outdoor Recreation", "Parenting & Kids", "Performing Arts", "Personal Care",
// "Pets", "Philosophy", "Photography", "Psychology", "Public Relations", "Real Estate",
// "Renewable Energy", "Retail", "Robotics", "Science", "Security", "Social Entrepreneurship",
// "Social Impact", "Social Media", "Software Development", "Spirituality", "Sports",
// "Sustainability", "Teaching & Education", "Tech & Gadgets", "Telecommunications",
// "Transportation", "Travel & Tourism", "Video & Production", "Virtual Reality",
// "Web Design & Development", "Wine & Spirits"

// ----

//          ✍️ USER INPUT:
//          """${userInput}"""
//    `;

//   try {
//     const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         // Primary model + fallback chain
//        model: "google/gemini-2.0-flash-exp:free", // Primary free model
//         models: [
//           "openai/gpt-oss-20b:free",
//           "deepseek/deepseek-chat-v3-0324:free",
//         ],
//         messages: [
//           {
//             role: "system",
//             content: "You are a structured-writing assistant that outputs valid JSON only.",
//           },
//           {
//             role: "user",
//             content: basePrompt,
//           },
//         ],
//         temperature: 0.7,
//       }),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       console.error("OpenRouter API error:", data);
//       throw new Error(data.error?.message || "Failed to generate structured press kit data");
//     }

//     const rawText = data.choices?.[0]?.message?.content || "";
//     const usedModel = data.model || "Unknown";

//     // Clean and parse JSON safely
//     const jsonMatch = rawText.match(/\{[\s\S]*\}/);
//     if (!jsonMatch) throw new Error("No JSON found in model response");

//     const parsedData = JSON.parse(jsonMatch[0]);

//     console.log("✅ Parsed data:", parsedData);
//     return {
//       ...parsedData,
//       modelUsed: usedModel,
//     };
//   } catch (error) {
//     console.error("AI generation error:", error);
//     return {
//       is_brand_collaboration: false,
//       title: "Untitled project",
//       description: "Unable to generate AI summary due to network or API issue.",
//       industries: [],
//       considerations: {
//         general: "Try again later or check your OpenRouter API key.",
//       },
//       modelUsed: "None (fallback failed)",
//     };
//   }
// };



