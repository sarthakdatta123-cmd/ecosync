const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

let sensorData = {
  temperature: 30,
  humidity: 70,
  soil: 40
};

// GET data
app.get("/data", (req, res) => {
  res.json(sensorData);
});

// UPDATE data
app.post("/update", (req, res) => {
  sensorData = req.body;
  res.json({ message: "Updated" });
});

// WEATHER API
app.get("/weather", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=Kolkata&appid=${process.env.WEATHER_KEY}&units=metric`
    );
    res.json(response.data);
  } catch {
    res.status(500).json({ error: "Weather error" });
  }
});

// IRRIGATION LOGIC
app.get("/irrigation", async (req, res) => {
  try {
    const soil = sensorData.soil;

    const weather = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=Kolkata&appid=${process.env.WEATHER_KEY}&units=metric`
    );

    const rain = weather.data.weather[0].main.includes("Rain");

    let decision = soil < 50 && !rain
      ? "Water plants now 🌱"
      : "No watering needed ✅";

    res.json({ decision });
  } catch {
    res.status(500).json({ error: "Logic error" });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));

app.get("/ai", async (req, res) => {
  try {
    const prompt = "Give short eco-friendly tips based on environment data";

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json(response.data.choices[0].message);
  } catch (err) {
    res.status(500).json({ error: "AI failed" });
  }
});