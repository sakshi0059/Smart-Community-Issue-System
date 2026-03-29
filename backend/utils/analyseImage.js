const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
require("dotenv").config({ path: __dirname + "/../.env" });

const CIVIC_CATEGORIES = [
  "Roads & Transport",
  "Street Lighting",
  "Garbage & Sanitation",
  "Water Supply & Drainage",
  "Electricity",
  "Public Safety",
  "Other",
];

const PROMPT = `
You are an AI assistant for a civic issue reporting system.

Analyze the image and classify ONLY if it clearly shows a civic problem.

Valid categories:
${CIVIC_CATEGORIES.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Rules:
- Only classify if it clearly shows a real civic issue
- If image is normal → return "Other"
- Title should describe issue (not object)

Return ONLY JSON:
{
  "category": "<one of the fixed categories>",
  "title": "<max 10 words>"
}
`.trim();

const FALLBACK = { category: "Other", title: "AI unavailable" };

// ⏳ delay helper
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// 🔁 Retry helper
async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);

      if (!res.ok) {
        if (res.status === 429) {
          console.warn(`⏳ Rate limit hit (attempt ${attempt})`);
          await delay(2000 * attempt);
          continue;
        }
        throw new Error(`${res.status} ${res.statusText}`);
      }

      return res;
    } catch (err) {
      if (attempt === retries) {
        console.error("❌ All retries failed:", err.message);
        throw err;
      }
      await delay(2000 * attempt);
    }
  }
}

// 🧠 MAIN FUNCTION
async function analyzeImage(imageUrl) {
  if (!imageUrl || !process.env.OPENROUTER_API_KEY) return FALLBACK;

  try {
    const response = await fetchWithRetry(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemma-3-12b-it:free",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: PROMPT },
                {
                  type: "image_url",
                  image_url: { url: imageUrl },
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error("❌ API Error:", data.error.message);
      return FALLBACK;
    }

    const raw = data?.choices?.[0]?.message?.content?.trim();
    if (!raw) return FALLBACK;

    try {
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const result = JSON.parse(cleaned);

      if (!CIVIC_CATEGORIES.includes(result.category)) {
        result.category = "Other";
      }

      return result;
    } catch {
      return { category: "Other", title: raw };
    }

  } catch (err) {
    console.error("❌ Final AI failure:", err.message);
    return FALLBACK;
  }
}

module.exports = analyzeImage;