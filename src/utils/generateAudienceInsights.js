import { GoogleGenerativeAI } from "@google/generative-ai";

// Load both keys from .env
const GEMINI_KEYS = [
  process.env.NEXT_PUBLIC_GEMINI_API_KEY_1,
  process.env.NEXT_PUBLIC_GEMINI_API_KEY_2,
].filter(Boolean); // removes undefined keys

const MODEL = "gemini-2.5-flash-lite";

const generateAudienceInsights = async (demographicData) => {
  if (!GEMINI_KEYS.length) {
    throw new Error("No Gemini API keys configured");
  }

  const prompt = `
You are an audience strategist helping creators present their audience strengths to potential brand partners.

Use the following demographic data to generate insights that highlight clear, positive traits in the influencer’s Instagram audience.

Data:
- Gender distribution: ${JSON.stringify(demographicData.genderData)}
- Age ranges: ${JSON.stringify(demographicData.ageData)}
- Top countries: ${JSON.stringify(demographicData.countryData)}

✅ Output Format:
Write 1–2 bullet points under each of the following sections, as applicable:

**Gender Insight:**  
- Primary insight about gender distribution or skew (required)  
- Optional: Add a second bullet if a related observation is statistically strong (e.g., balanced split, low variability, or niche skew)

**Age Insight:**  
- Primary insight about dominant or skewed age group (required)  
- Optional: Add a second bullet if another age band is also meaningfully represented (e.g., crossover across Gen Z + Millennials)

**Location Insight:**  
- Primary insight about top country or regional concentration (required)  
- Optional: Add a second bullet if there's a meaningful secondary country, diaspora audience, or Tier 2/3 signal

✅ Guidelines:
- Frame positively (e.g., “Millennial focused” instead of “low Gen Z”)
- Use percentages to highlight strength or clarity
- Avoid repeating raw data — interpret it
- No assumptions about behavior, profession, or income
- No vague phrases or uncertainty (“could be”, “might”, “needs more info”)
- Keep each bullet under 25 words

✅ Example Output:

**Gender Insight:**  
- 68% female audience shows strong alignment with women-focused communities.  
- Gender distribution is highly skewed, offering a focused audience profile.

**Age Insight:**  
- 25–34 dominates at 71%, indicating a clearly Millennial audience.  
- 18–24 also forms 19%, offering some Gen Z crossover potential.

**Location Insight:**  
- 78% of the audience is India-based, ideal for local brand alignment.  
- US (12%) adds diaspora depth to domestic reach.

✅ Return format:
Return your insights in **pure JSON format only**, as shown below — without any extra text, explanation, or Markdown:

{
  "gender": "Your bullet points for gender insight go here, separated by line breaks if two points exist.",
  "age": "Your bullet points for age insight go here, separated by line breaks if two points exist.",
  "location": "Your bullet points for location insight go here, separated by line breaks if two points exist."
}
`;

  // Try each Gemini API key in sequence
  for (let i = 0; i < GEMINI_KEYS.length; i++) {
    const key = GEMINI_KEYS[i];
    try {
      console.log(`🔑 Using Gemini key ${i + 1}`);

      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: MODEL });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const rawText = response.text();

      const cleanedJson = rawText
        .replace(/```json\s*/, "")
        .replace(/```[\s\n]*$/, "")
        .trim();

      return JSON.parse(cleanedJson);
    } catch (error) {
      const msg = error?.message || error.toString();
      console.warn(`❌ Gemini key ${i + 1} failed:`, msg);

      // If quota or rate limit issue → try next key
      if ( msg.includes("429") ||
        msg.toLowerCase().includes("quota") ||
        msg.toLowerCase().includes("rate limit") ||
        msg.toLowerCase().includes("resource exhausted") ||
        msg.toLowerCase().includes("service unavailable") ||
        msg.toLowerCase().includes("too many requests") ||
        msg.toLowerCase().includes("model overloaded") ) {
        console.log("⚙️ Switching to next Gemini API key...");
        continue;
      }

      // Otherwise stop immediately
      throw error;
    }
  }

  // All keys failed
  return {
    gender: "Unable to generate gender insight.",
    age: "Unable to generate age insight.",
    location: "Unable to generate location insight.",
  };
};

export default generateAudienceInsights;



// // utils/geminiClient.js
// import { GoogleGenerativeAI } from "@google/generative-ai";

// const GEMINI_KEYS = process.env.NEXT_PUBLIC_GEMINI_KEYS?.split(",") || [];
// const MODEL = "gemini-2.5-flash-lite";

// /**
//  * Generate audience insights with automatic Gemini API key fallback.
//  */
// export async function generateAudienceInsights(demographicData) {
//   if (!GEMINI_KEYS.length) {
//     throw new Error("No Gemini API keys configured");
//   }

//     const prompt = `
// You are an audience strategist helping creators present their audience strengths to potential brand partners.

// Use the following demographic data to generate insights that highlight clear, positive traits in the influencer’s Instagram audience.

// Data:
// - Gender distribution: ${JSON.stringify(demographicData.genderData)}
// - Age ranges: ${JSON.stringify(demographicData.ageData)}
// - Top countries: ${JSON.stringify(demographicData.countryData)}

// ✅ Output Format:
// Write 1–2 bullet points under each of the following sections, as applicable:

// **Gender Insight:**  
// - Primary insight about gender distribution or skew (required)  
// - Optional: Add a second bullet if a related observation is statistically strong (e.g., balanced split, low variability, or niche skew)

// **Age Insight:**  
// - Primary insight about dominant or skewed age group (required)  
// - Optional: Add a second bullet if another age band is also meaningfully represented (e.g., crossover across Gen Z + Millennials)

// **Location Insight:**  
// - Primary insight about top country or regional concentration (required)  
// - Optional: Add a second bullet if there's a meaningful secondary country, diaspora audience, or Tier 2/3 signal

// ✅ Guidelines:
// - Frame positively (e.g., “Millennial focused” instead of “low Gen Z”)
// - Use percentages to highlight strength or clarity
// - Avoid repeating raw data — interpret it
// - No assumptions about behavior, profession, or income
// - No vague phrases or uncertainty (“could be”, “might”, “needs more info”)
// - Keep each bullet under 25 words

// ✅ Example Output:

// **Gender Insight:**  
// - 68% female audience shows strong alignment with women-focused communities.  
// - Gender distribution is highly skewed, offering a focused audience profile.

// **Age Insight:**  
// - 25–34 dominates at 71%, indicating a clearly Millennial audience.  
// - 18–24 also forms 19%, offering some Gen Z crossover potential.

// **Location Insight:**  
// - 78% of the audience is India-based, ideal for local brand alignment.  
// - US (12%) adds diaspora depth to domestic reach.

// ✅ Return format:
// Return your insights in **pure JSON format only**, as shown below — without any extra text, explanation, or Markdown:

// {
//   "gender": "Your bullet points for gender insight go here, separated by line breaks if two points exist.",
//   "age": "Your bullet points for age insight go here, separated by line breaks if two points exist.",
//   "location": "Your bullet points for location insight go here, separated by line breaks if two points exist."
// }
// `;

//   for (let i = 0; i < GEMINI_KEYS.length; i++) {
//     const key = GEMINI_KEYS[i];
//     try {
//       const genAI = new GoogleGenerativeAI(key);
//       const model = genAI.getGenerativeModel({ model: MODEL });

//       const result = await model.generateContent(prompt);
//       const response = await result.response;
//       const rawText = response.text();

//       const cleanedJson = rawText
//         .replace(/```json\s*/, "")
//         .replace(/```[\s\n]*$/, "")
//         .trim();

//       return JSON.parse(cleanedJson);
//     } catch (error) {
//       const message = error?.message || "";
//       console.warn(`Key ${i + 1} failed:`, message);

//       // Fallback trigger: rate limit or quota exceeded
//       if (
//         message.includes("429") ||
//         message.includes("quota") ||
//         message.includes("Rate limit")
//       ) {
//         console.log(`Switching to next API key...`);
//         continue;
//       }

//       // Other errors → stop early
//       throw error;
//     }
//   }

//   // All keys failed
//   return {
//     gender: "Unable to generate gender insight.",
//     age: "Unable to generate age insight.",
//     location: "Unable to generate location insight.",
//   };
// }


































// utils/generateAudienceInsights.js

// export const generateAudienceInsights = async (demographicData) => {
//   try {
//     if (!process.env.NEXT_PUBLIC_OPENROUTER_API_KEY) {
//       throw new Error("OpenRouter API key is not configured");
//     }

//     const prompt = `
// You are an audience strategist helping creators present their audience strengths to potential brand partners.

// Use the following demographic data to generate insights that highlight clear, positive traits in the influencer’s Instagram audience.

// Data:
// - Gender distribution: ${JSON.stringify(demographicData.genderData)}
// - Age ranges: ${JSON.stringify(demographicData.ageData)}
// - Top countries: ${JSON.stringify(demographicData.countryData)}

// ✅ Output Format:
// Write 1–2 bullet points under each of the following sections, as applicable:

// **Gender Insight:**  
// - Primary insight about gender distribution or skew (required)  
// - Optional: Add a second bullet if a related observation is statistically strong (e.g., balanced split, low variability, or niche skew)

// **Age Insight:**  
// - Primary insight about dominant or skewed age group (required)  
// - Optional: Add a second bullet if another age band is also meaningfully represented (e.g., crossover across Gen Z + Millennials)

// **Location Insight:**  
// - Primary insight about top country or regional concentration (required)  
// - Optional: Add a second bullet if there's a meaningful secondary country, diaspora audience, or Tier 2/3 signal

// ✅ Guidelines:
// - Frame positively (e.g., “Millennial focused” instead of “low Gen Z”)
// - Use percentages to highlight strength or clarity
// - Avoid repeating raw data — interpret it
// - No assumptions about behavior, profession, or income
// - No vague phrases or uncertainty (“could be”, “might”, “needs more info”)
// - Keep each bullet under 25 words

// ✅ Example Output:

// **Gender Insight:**  
// - 68% female audience shows strong alignment with women-focused communities.  
// - Gender distribution is highly skewed, offering a focused audience profile.

// **Age Insight:**  
// - 25–34 dominates at 71%, indicating a clearly Millennial audience.  
// - 18–24 also forms 19%, offering some Gen Z crossover potential.

// **Location Insight:**  
// - 78% of the audience is India-based, ideal for local brand alignment.  
// - US (12%) adds diaspora depth to domestic reach.

// ✅ Return format:
// Return your insights in **pure JSON format only**, as shown below — without any extra text, explanation, or Markdown:

// {
//   "gender": "Your bullet points for gender insight go here, separated by line breaks if two points exist.",
//   "age": "Your bullet points for age insight go here, separated by line breaks if two points exist.",
//   "location": "Your bullet points for location insight go here, separated by line breaks if two points exist."
// }
// `;

//     // 🔹 Make request to OpenRouter
//     const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         model: "google/gemini-2.0-flash-exp:free", // Primary free model
//         models: [
//           "openai/gpt-oss-20b:free",
//           "deepseek/deepseek-chat-v3-0324:free",
//         ],
//         messages: [
//           { role: "system", content: "You are an audience strategist helping creators present their audience strengths to potential brand partners that outputs clean JSON only." },
//           { role: "user", content: prompt },
//         ],
//       }),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       console.error("OpenRouter API error:", data);
//       throw new Error(data.error?.message || "Failed to generate audience insights");
//     }

//     const rawText = data.choices?.[0]?.message?.content || "";
//     const usedModel = data.model || "Unknown";

//     const cleanedJson = rawText
//       .replace(/```json\s*/gi, "")
//       .replace(/```[\s\n]*$/g, "")
//       .trim();

//     const parsed = JSON.parse(cleanedJson);
//     console.log("MODEL USED FOR INSIGHTS:", usedModel)

//     // ✅ Return structured output + model used
//     return {
//       ...parsed,
//       modelUsed: usedModel,
//     };
//   } catch (error) {
//     console.error("Error generating insights:", error);
//     return {
//       gender: "Unable to generate gender insight.",
//       age: "Unable to generate age insight.",
//       location: "Unable to generate location insight.",
//       modelUsed: "None (fallback failed)",
//     };
//   }
// };

// export default generateAudienceInsights;


// For simple summarization tasks, the reasoning layer is not necessary, and you can speed it up by:

// Simplifying the system prompt.

// Lowering max_tokens.

// Optionally caching responses if demographic data repeats (you already have a cache in your Next.js setup).
// Would you like me to add rate limiting + caching (e.g., via Redis or in-memory cache) so you don’t hit OpenRouter rate caps during heavy MVP testing? Would you like me to make this work with Next.js API routes (like /api/generateInsights) so your frontend never exposes the OpenRouter key? That’s the correct production-safe setup. yes do it! and also i would not get anytime downtime and model overload error with this setup? if my primary gemini model doesnt work then i will fallback to other model which is defined in my models array?