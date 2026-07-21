import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// ── Weather Types ──

interface WeatherData {
  temp: number;
  humidity: number;
  rainfall: number;
  avgTemp?: number;
  rainMm?: number;
}

// ── Weather Fetch (OpenWeatherMap) ──

async function fetchWeather(taluka: string, district: string): Promise<WeatherData> {
  const apiKey = Deno.env.get("OPENWEATHER_API_KEY");
  if (!apiKey) throw new Error("OPENWEATHER_API_KEY not set");

  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(taluka)},${encodeURIComponent(district)},IN&appid=${apiKey}&units=metric`,
  );
  if (!res.ok) throw new Error("Weather fetch failed");
  const data = await res.json();

  return {
    temp: data.main?.temp ?? 28,
    humidity: data.main?.humidity ?? 65,
    rainfall: data.rain?.["1h"] ?? 0,
    avgTemp: data.main?.temp ?? 28,
    rainMm: data.rain?.["1h"] ?? 0,
  };
}

// ── Pest Risk Evaluation (mirrors pestWarningEngine.ts) ──

interface PestRiskResult {
  hasRisks: boolean;
  risks: { name: string; severity: string; treatment: string }[];
}

function evaluatePestRisks(
  daysSincePlanting: number,
  weather: WeatherData,
  currentMonth: number,
  variety: string,
): PestRiskResult {
  const risks: { name: string; severity: string; treatment: string }[] = [];

  // Early Shoot Borer: day 15-90, temp 25-30, humidity >70, month 3-6
  if (
    daysSincePlanting >= 15 && daysSincePlanting <= 90 &&
    (weather.avgTemp ?? weather.temp) >= 25 && (weather.avgTemp ?? weather.temp) <= 30 &&
    weather.humidity > 70 &&
    currentMonth >= 3 && currentMonth <= 6
  ) {
    risks.push({
      name: "लहान ठुमटी अळी",
      severity: "high",
      treatment: "कार्टाप हायड्रोक्लोराइड 4% GR 10 किग्रॅ./एकर",
    });
  }

  // Red Rot: day >90, rain >50mm, humidity >85
  if (
    daysSincePlanting > 90 &&
    (weather.rainMm ?? weather.rainfall) > 50 &&
    weather.humidity > 85
  ) {
    risks.push({
      name: "लाल रोट",
      severity: "critical",
      treatment: "प्रतिबंधक फवारणी करा. रोगग्रस्त ऊस काढून टाका.",
    });
  }

  // Smut: month 5-6 or 10-11, humidity >75
  if (
    ((currentMonth >= 5 && currentMonth <= 6) || (currentMonth >= 10 && currentMonth <= 11)) &&
    weather.humidity > 75
  ) {
    risks.push({
      name: "कोळी रोग",
      severity: "medium",
      treatment: "प्रोपिकोनाझोल 25% EC 400 मिली./एकर फवारणी",
    });
  }

  // Internode Borer: day >120, temp >28
  if (daysSincePlanting > 120 && (weather.avgTemp ?? weather.temp) > 28) {
    risks.push({
      name: "आंतरगाठ अळी",
      severity: "high",
      treatment: "कार्टाप हायड्रोक्लोराइड 4% GR 10 किग्रॅ./एकर",
    });
  }

  // Top Borer: day >120, temp >28
  if (daysSincePlanting > 120 && (weather.avgTemp ?? weather.temp) > 28) {
    risks.push({
      name: "वरची खोड अळी",
      severity: "high",
      treatment: "फ्लुबेंडामाइड 20% WG 100 ग्रॅ./एकर",
    });
  }

  // Wilt: day >10, variety not Co0238 (Co0238 is resistant)
  if (daysSincePlanting > 10 && variety !== "Co0238") {
    risks.push({
      name: "मर रोग",
      severity: "medium",
      treatment: "ट्रायकोडर्मा विरिडी 2 किग्रॅ./एकर जमिनीत मिसळा",
    });
  }

  return { hasRisks: risks.length > 0, risks };
}

// ── Main Handler ──

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Auth: cron secret
  const cronSecret = req.headers.get("x-cron-secret");
  const expectedSecret = Deno.env.get("CRON_SECRET");
  if (!expectedSecret || cronSecret !== expectedSecret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Fetch active fields with recent water activity (sessions in last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const { data: fields, error: fieldErr } = await supabase
    .from("fields")
    .select("id, planting_date, sugarcane_variety, village, consumer_id, users!consumer_id(id, phone, name, subscription_status)")
    .eq("is_active", true)
    .eq("users.subscription_status", "active")
    .filter("id", "in", `(select field_id from water_sessions where created_at > '${sevenDaysAgo}')`);

  if (fieldErr) {
    return new Response(JSON.stringify({ error: fieldErr.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const alerts: { field: string; pest: string; severity: string }[] = [];
  const currentMonth = new Date().getMonth() + 1;

  for (const field of fields || []) {
    try {
      const weather = await fetchWeather(field.village || "Kolhapur", "Kolhapur");

      // Calculate days since planting
      const daysSincePlanting = field.planting_date
        ? Math.floor((Date.now() - new Date(field.planting_date).getTime()) / 86_400_000)
        : 0;

      const result = evaluatePestRisks(
        daysSincePlanting,
        weather,
        currentMonth,
        field.sugarcane_variety || "Co86032",
      );

      if (result.hasRisks) {
        for (const risk of result.risks) {
          const { error: alertErr } = await supabase.from("pest_alerts").insert({
            consumer_id: field.consumer_id,
            field_id: field.id,
            pest_type: risk.name,
            risk_level: risk.severity,
            trigger_reason: risk.treatment,
            weather_data: weather,
            advisory_marathi: risk.treatment,
            created_at: new Date().toISOString(),
          });

          if (alertErr) {
            console.error("Alert insert error:", alertErr);
            continue;
          }

          // Enqueue WATI notification for consumer
          const consumer = field.users;
          if (consumer?.phone) {
            await supabase.from("job_queue").insert({
              job_type: "wati_send",
              payload: {
                phone: consumer.phone,
                template: "pest_alert",
                params: [
                  { name: "farmer_name", value: consumer.name || "शेतकरी" },
                  { name: "pest_name", value: risk.name },
                  { name: "severity", value: risk.severity },
                ],
                consumer_id: field.consumer_id,
              },
              status: "pending",
              max_attempts: 3,
              created_at: new Date().toISOString(),
            });
          }

          alerts.push({ field: field.id, pest: risk.name, severity: risk.severity });
        }
      }
    } catch (err) {
      console.error(`Error processing field ${field.id}:`, err);
    }
  }

  return new Response(JSON.stringify({ success: true, alerts }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
