# Assignment 2 — Backend API Integration & Service Development

## Overview
This project demonstrates server-side API integration using Node.js and Express.
The application fetches real-time weather data for a given city and enhances it with additional information from external APIs.

All third-party API requests are executed strictly on the **server side**, as required.

---

## Tech Stack
- Node.js
- Express.js
- dotenv
- cors
- nodemon (development)

---

## Features
### 1. Weather API (Core Requirement)
- Fetches current weather data using **OpenWeather API**
- Returns only required and clean fields:
  - temperature
  - feels_like
  - description
  - wind_speed
  - coordinates (lat, lon)
  - country_code
  - rain_last_3h

### 2. Additional API Integrations
#### a) REST Countries API
- Uses `country_code` from weather response
- Returns:
  - country name
  - capital
  - region
  - population
  - currency
  - flag

#### b) Lyrics API (lyrics.ovh)
- Fetches song lyrics metadata
- Returns **only safe data**:
  - found (boolean)
  - lyrics preview (up to 90 characters)
  - lyrics length
  - number of lines





## Setup Instructions

### 1. Install dependencies
```bash
npm install
2. Create .env file
env
 
OPENWEATHER_API_KEY=YOUR_API_KEY_HERE
PORT=3000
3. Run the server
bash
 
npm run dev
Open in browser:

arduino
 
http://localhost:3000
API Endpoints
Weather
bash
 
GET /api/weather?city=Almaty
Example response:

json
 
{
  "temperature": -2.05,
  "description": "mist",
  "coordinates": { "lat": 43.25, "lon": 76.95 },
  "feels_like": -2.05,
  "wind_speed": 1,
  "country_code": "KZ",
  "rain_last_3h": 0
}
Country Info
bash
 
GET /api/country?code=KZ
Returns country details including currency and flag.

Lyrics Metadata
bash
 
GET /api/lyrics?artist=Coldplay&title=Yellow
Example response:

json
 
{
  "artist": "Coldplay",
  "title": "Yellow",
  "found": true,
  "preview_90chars": "Look at the stars look how they shine for you...",
  "lyrics_length": 2400,
  "lines_count": 36
}