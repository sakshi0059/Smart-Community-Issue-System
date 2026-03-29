const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

async function getLocation(lat, lon) {
  try {
    const apiKey = process.env.OPENCAGE_API_KEY;

    console.log("👉 OpenCage KEY:", apiKey);

    if (!apiKey) {
      console.error("❌ API key missing");
      return { city: "", state: "" };
    }

    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${apiKey}`;

    const res = await fetch(url);
    const data = await res.json();

    console.log("📍 OpenCage API data:", data);

    if (!data.results || data.results.length === 0) {
      return { city: "", state: "" };
    }

    const components = data.results[0].components;

    const city =
      components.city ||
      components.town ||
      components.village ||
      components.hamlet ||
      components.county ||
      "";

    const state = components.state || "";

    return { city, state };

  } catch (err) {
    console.error("❌ Error fetching location:", err.message);
    return { city: "", state: "" };
  }
}

module.exports = getLocation;