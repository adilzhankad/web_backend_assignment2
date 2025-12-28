// ------- Weather UI -------
const form = document.getElementById("form");
const cityInput = document.getElementById("city");
const errorBox = document.getElementById("error");

const temp = document.getElementById("temp");
const feels = document.getElementById("feels");
const desc = document.getElementById("desc");
const wind = document.getElementById("wind");
const country = document.getElementById("country");
const rain = document.getElementById("rain");
const coords = document.getElementById("coords");
const raw = document.getElementById("raw");

const countryInfo = document.getElementById("countryInfo");
const flag = document.getElementById("flag");

// ------- Lyrics UI -------
const lyricsForm = document.getElementById("lyricsForm");
const artistInput = document.getElementById("artist");
const titleInput = document.getElementById("title");
const lyricsInfo = document.getElementById("lyricsInfo");

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.classList.remove("hidden");
}

function hideError() {
  errorBox.textContent = "";
  errorBox.classList.add("hidden");
}

async function fetchCountryByCode(code) {
  const r = await fetch(`/api/country?code=${encodeURIComponent(code)}`);
  const data = await r.json();
  return { ok: r.ok, data };
}

// -----------------------------
// Weather submit
// -----------------------------
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const city = cityInput.value.trim();
  if (!city) return;

  hideError();
  raw.textContent = "Loading...";

  try {
    // 1) Weather
    const r = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
    const w = await r.json();

    if (!r.ok) {
      showError(w.error || "Weather request failed");
      raw.textContent = JSON.stringify(w, null, 2);
      return;
    }

    temp.textContent = `${w.temperature} °C`;
    feels.textContent = `${w.feels_like} °C`;
    desc.textContent = w.description;
    wind.textContent = `${w.wind_speed} m/s`;
    country.textContent = w.country_code;
    rain.textContent = `${w.rain_last_3h} mm`;
    coords.textContent = `lat: ${w.coordinates.lat}, lon: ${w.coordinates.lon}`;

    // 2) Country info
    try {
      const { ok, data: c } = await fetchCountryByCode(w.country_code);

      if (ok) {
        const currencyText = c.currency
          ? `${c.currency.code}${c.currency.symbol ? " (" + c.currency.symbol + ")" : ""}`
          : "—";

        countryInfo.textContent =
          `Name: ${c.name} | Capital: ${c.capital || "—"} | Region: ${c.region || "—"} | Currency: ${currencyText}`;

        if (c.flag_png) {
          flag.src = c.flag_png;
          flag.classList.remove("hidden");
        } else {
          flag.classList.add("hidden");
        }
      } else {
        countryInfo.textContent = "—";
        flag.classList.add("hidden");
      }
    } catch (_) {
      countryInfo.textContent = "—";
      flag.classList.add("hidden");
    }

    raw.textContent = JSON.stringify(w, null, 2);
  } catch (err) {
    showError("Network/server error");
    raw.textContent = String(err);
  }
});

// -----------------------------
// Lyrics submit (preview + metadata)
// -----------------------------
lyricsForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const artist = artistInput.value.trim();
  const title = titleInput.value.trim();

  if (!artist || !title) {
    lyricsInfo.textContent = "Please enter artist and title.";
    return;
  }

  lyricsInfo.textContent = "Searching...";

  try {
    const r = await fetch(
      `/api/lyrics?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`
    );
    const data = await r.json();

    if (!r.ok) {
      lyricsInfo.textContent = data.error || "Lyrics request failed";
      return;
    }

    if (!data.found) {
      lyricsInfo.textContent = "Not found.";
      return;
    }

    lyricsInfo.textContent =
      `Found: YES | Lines: ${data.lines_count} | Length: ${data.lyrics_length} chars | Preview: "${data.preview_90chars}..."`;
  } catch (err) {
    lyricsInfo.textContent = "Lyrics API error.";
  }
});
