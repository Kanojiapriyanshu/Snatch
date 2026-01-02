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
