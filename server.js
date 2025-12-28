const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const API_KEY = process.env.OPENWEATHER_API_KEY;
const PORT = process.env.PORT || 3000;

// -----------------------------
// 1) Weather API (server-side)
// GET /api/weather?city=Almaty
// -----------------------------
app.get("/api/weather", async (req, res) => {
  try {
    const city = (req.query.city || "").trim();

    if (!city) {
      return res.status(400).json({ error: "city query param is required" });
    }

    if (!API_KEY) {
      return res.status(500).json({ error: "OPENWEATHER_API_KEY is not set" });
    }

    const url =
      `https://api.openweathermap.org/data/2.5/weather` +
      `?q=${encodeURIComponent(city)}` +
      `&appid=${API_KEY}` +
      `&units=metric`;

    const r = await fetch(url);
    const data = await r.json();

    if (!r.ok) {
      return res.status(r.status).json({
        error: data?.message || "OpenWeather error",
      });
    }

    return res.json({
      temperature: data.main?.temp,
      description: data.weather?.[0]?.description,
      coordinates: { lat: data.coord?.lat, lon: data.coord?.lon },
      feels_like: data.main?.feels_like,
      wind_speed: data.wind?.speed,
      country_code: data.sys?.country,
      rain_last_3h: data.rain?.["3h"] ?? 0,
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: String(err) });
  }
});

// ----------------------------------------
// 2) Additional API: REST Countries (server-side)
// GET /api/country?code=KZ
// ----------------------------------------
app.get("/api/country", async (req, res) => {
  try {
    const code = (req.query.code || "").trim().toUpperCase();
    if (!code) {
      return res.status(400).json({ error: "code query param is required" });
    }

    const url = `https://restcountries.com/v3.1/alpha/${encodeURIComponent(code)}`;
    const r = await fetch(url);
    const data = await r.json();

    if (!r.ok || !Array.isArray(data) || !data[0]) {
      return res.status(404).json({ error: "Country not found" });
    }

    const c = data[0];

    const currenciesObj = c.currencies || {};
    const firstCurrencyKey = Object.keys(currenciesObj)[0];
    const currencyName = firstCurrencyKey ? currenciesObj[firstCurrencyKey]?.name : null;
    const currencySymbol = firstCurrencyKey ? currenciesObj[firstCurrencyKey]?.symbol : null;

    return res.json({
      code,
      name: c.name?.official || c.name?.common || null,
      capital: Array.isArray(c.capital) ? c.capital[0] : null,
      region: c.region || null,
      population: c.population || null,
      flag_png: c.flags?.png || null,
      currency: firstCurrencyKey
        ? { code: firstCurrencyKey, name: currencyName, symbol: currencySymbol }
        : null,
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: String(err) });
  }
});

// ----------------------------------------
// 3) Additional API: Lyrics.ovh (server-side)
// SAFE: preview up to 90 chars + metadata
// GET /api/lyrics?artist=Coldplay&title=Adventure%20of%20a%20Lifetime
// ----------------------------------------
app.get("/api/lyrics", async (req, res) => {
  try {
    const artist = (req.query.artist || "").trim();
    const title = (req.query.title || "").trim();

    if (!artist || !title) {
      return res.status(400).json({ error: "artist and title query params are required" });
    }

    const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
    const r = await fetch(url);
    const data = await r.json();

    const lyrics = typeof data?.lyrics === "string" ? data.lyrics : "";
    const found = Boolean(lyrics);

    const preview = found
      ? lyrics.replace(/\s+/g, " ").trim().slice(0, 1000)
      : null;

    return res.json({
      artist,
      title,
      found,
      preview_90chars: preview,
      lyrics_length: lyrics.length,
      lines_count: found ? lyrics.split("\n").filter(Boolean).length : 0,
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running: http://localhost:${PORT}`);
});
