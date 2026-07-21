import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface WeatherData {
  temp: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  cached: boolean;
}

const cache = new Map<string, { data: WeatherData; expiresAt: number }>();
const CACHE_TTL_MS = 3600_000; // 1 hour

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const taluka = url.searchParams.get("taluka");
  const district = url.searchParams.get("district");

  if (!taluka || !district) {
    return new Response(JSON.stringify({ error: "taluka and district are required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const cacheKey = `${district}:${taluka}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return new Response(JSON.stringify({ ...cached.data, cached: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const apiKey = Deno.env.get("OPENWEATHER_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "OPENWEATHER_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Use taluka,district as query (geocoding not implemented here, simplified)
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(taluka)},${encodeURIComponent(district)},IN&appid=${apiKey}&units=metric`
    );
    if (!weatherRes.ok) {
      throw new Error(`OpenWeatherMap error: ${weatherRes.status}`);
    }
    const json = await weatherRes.json();

    const rain = json.rain ? (json.rain["1h"] || json.rain["3h"] || 0) : 0;
    const weather: WeatherData = {
      temp: json.main.temp,
      humidity: json.main.humidity,
      rainfall: rain,
      windSpeed: json.wind.speed,
      cached: false,
    };

    cache.set(cacheKey, { data: weather, expiresAt: Date.now() + CACHE_TTL_MS });

    return new Response(JSON.stringify(weather), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
