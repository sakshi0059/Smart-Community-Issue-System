/*
async function getLocation(lat, lon) {
  const apiKey = process.env.OPENCAGE_API_KEY;
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${apiKey}`;

  const res = await fetch(url);
  const data = await res.json();

  const components = data.results[0]?.components || {};
  const city = components.city || components.town || components.village || components.hamlet || components.county || "";
  const state = components.state || "";

  return { city, state };
}
module.exports = getLocation;
*/

async function getLocation(lat, lon) {
  const apiKey = process.env.OPENCAGE_API_KEY;
<<<<<<< HEAD

  console.log("👉 OpenCage KEY:", apiKey); // ADD THIS

=======
>>>>>>> 8341e849b93b4078d68c375fc068c421c8ac203d
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log("OpenCage API data:", data);

    const components = data.results[0]?.components || {};
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
    console.error("Error fetching location:", err);
    return { city: "", state: "" };
  }
}

module.exports = getLocation;