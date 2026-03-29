/*
This function analyzes an image and classifies it into a civic category. It uses the OpenRouter API to process the image and return a structured JSON response containing the category and a concise title.
*/
<<<<<<< HEAD
/*const fs = require('fs');
console.log("__dirname =", __dirname);
console.log("Looking for .env at:", __dirname + '/../.env');
console.log("Exists?", fs.existsSync(__dirname + '/../.env'));
console.log("API Key Loaded:", process.env.OPENROUTER_API_KEY);
require('dotenv').config({ path: __dirname + '/../.env' });
console.log("API Key Loaded:", process.env.OPENROUTER_API_KEY);
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
=======
>>>>>>> 8341e849b93b4078d68c375fc068c421c8ac203d
async function analyzeImage(imageUrl) {
    const prompt = `
Analyze the uploaded image and classify it into one of the following fixed civic categories:

1. Roads & Transport  
2. Street Lighting  
3. Garbage & Sanitation  
4. Water Supply & Drainage  
5. Electricity  
6. Public Safety  
7. Other

Return the result in structured JSON format:
{
  "category": "<one of the fixed categories above>",
  "title": "<a concise title, max 10 words>"
}
Only respond with the raw JSON object. Do not use Markdown formatting or triple backticks.
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
<<<<<<< HEAD
            "model": "mistralai/mistral-7b-instruct:free",
=======
            "model": "mistralai/mistral-small-3.2-24b-instruct:free",
>>>>>>> 8341e849b93b4078d68c375fc068c421c8ac203d
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": imageUrl
                            }
                        }
                    ]
                }
            ]
        })
    });

    const res = await response.json();
    console.log("FULL AI RESPONSE:", res);
    
    const message = res?.choices?.[0]?.message?.content;

    if (!message) {
    console.error("Invalid AI response:", res);
    return { category: "Other", title: "Unknown Issue" };
    }

    try {
        const result = JSON.parse(message);
        return result;
    } catch (error) {
        console.error("Error parsing response:", error);
        return { category: "Other", title: "Unknown Issue" };
    }
}

// (async () => {
//     const res = await analyzeImage("https://res.cloudinary.com/da3wjnlzg/image/upload/v1759671098/JagrukImageContainer/ihrc7ybnmwdbol8kl4dz.jpg");
//     const message = res.choices[0].message.content;

//     try {
//         const result = JSON.parse(message);
//         console.log(result);
//     } catch (error) {
//         console.error("Error parsing response:", error);
//     }
// })();
module.exports = analyzeImage;
<<<<<<< HEAD

(async () => {
    const result = await analyzeImage("https://res.cloudinary.com/da3wjnlzg/image/upload/v1759671098/JagrukImageContainer/ihrc7ybnmwdbol8kl4dz.jpg");
    console.log("AI Result:", result);
})();
*/
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
- Only classify as a category if it clearly shows a real issue
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

// 🔁 Retry helper with delay
async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);

      if (!res.ok) {
        // 🚨 Handle 429 specifically
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

      console.warn(`🔁 Retry attempt ${attempt}`);
      await delay(2000 * attempt);
    }
  }
}

// 🖼 URL → Base64
async function urlToBase64(imageUrl) {
  const res = await fetchWithRetry(imageUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "image/*,*/*;q=0.8",
    },
  });

  const buffer = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") || "image/jpeg";

  return {
    base64: buffer.toString("base64"),
    contentType,
  };
}

// 🧠 MAIN FUNCTION
async function analyzeImage(imageUrl, useBase64 = true) {
  if (!imageUrl) return FALLBACK;
  if (!process.env.OPENROUTER_API_KEY) return FALLBACK;

  let imagePayload;

  try {
    if (useBase64) {
      const { base64, contentType } = await urlToBase64(imageUrl);
      imagePayload = {
        type: "image_url",
        image_url: {
          url: `data:${contentType};base64,${base64}`,
        },
      };
    } else {
      imagePayload = {
        type: "image_url",
        image_url: { url: imageUrl },
      };
    }
  } catch (err) {
    console.error("❌ Image fetch failed:", err.message);
    return FALLBACK;
  }

  try {
    const response = await fetchWithRetry(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Jagruk App",
        },
        body: JSON.stringify({
          model: "google/gemma-3-12b-it:free",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: PROMPT },
                imagePayload,
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
=======
>>>>>>> 8341e849b93b4078d68c375fc068c421c8ac203d
