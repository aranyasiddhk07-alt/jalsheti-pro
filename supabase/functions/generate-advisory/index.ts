import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// ── Growth Stage (mirrors cropIntelligence.ts) ──

interface GrowthStage {
  stage: string;
  stageMarathi: string;
  dayNumber: number;
  irrigationIntervalDays: number;
  criticalityLevel: number;
}

const STAGE_DEFINITIONS = [
  { name: "germination", marathi: "उगवण", maxDay: 35, irrigationInterval: 7, criticality: 5 },
  { name: "tillering", marathi: "फुटवे", maxDay: 100, irrigationInterval: 8, criticality: 10 },
  { name: "grand_growth", marathi: "जोमदार वाढ", maxDay: 270, irrigationInterval: 10, criticality: 8 },
  { name: "maturity", marathi: "परिपक्वता", maxDay: 330, irrigationInterval: 15, criticality: 6 },
  { name: "harvest", marathi: "कापणी", maxDay: Infinity, irrigationInterval: 0, criticality: 0 },
];

function getGrowthStage(plantingDate: string): GrowthStage {
  const today = new Date();
  const planted = new Date(plantingDate);
  const dayNumber = Math.floor((today.getTime() - planted.getTime()) / 86_400_000);

  for (const s of STAGE_DEFINITIONS) {
    if (dayNumber <= s.maxDay) {
      return {
        stage: s.name,
        stageMarathi: s.marathi,
        dayNumber,
        irrigationIntervalDays: s.irrigationInterval,
        criticalityLevel: s.criticality,
      };
    }
  }
  const last = STAGE_DEFINITIONS[STAGE_DEFINITIONS.length - 1];
  return {
    stage: last.name,
    stageMarathi: last.marathi,
    dayNumber,
    irrigationIntervalDays: last.irrigationInterval,
    criticalityLevel: last.criticality,
  };
}

// ── Advisory Generation ──

function generateAdvisory(
  plantingDate: string,
  durationMinutes: number,
  _timeOfDay: string,
): string {
  const stage = getGrowthStage(plantingDate);
  const _day = stage.dayNumber;

  let durationCategory: string;
  if (durationMinutes < 45) durationCategory = "अपुरे";
  else if (durationMinutes <= 90) durationCategory = "योग्य";
  else durationCategory = "जास्त";

  let advisory: string;
  if (durationCategory === "अपुरे") {
    advisory = `आज पाणी ${durationMinutes} मिनिटे दिले. ${stage.stageMarathi} टप्प्यात पाणी अपुरे आहे. आठवड्यात ${stage.irrigationIntervalDays} दिवसांनी पुन्हा पाणी द्या.`;
  } else if (durationCategory === "योग्य") {
    advisory = `आज पाणी ${durationMinutes} मिनिटे दिले. ${stage.stageMarathi} टप्प्यात पाणी योग्य आहे. पुढचे पाणी ${stage.irrigationIntervalDays} दिवसांनी द्या.`;
  } else {
    advisory = `आज पाणी ${durationMinutes} मिनिटे दिले. ${stage.stageMarathi} टप्प्यात पाणी जास्त आहे. दुसऱ्या दिवशी पाणी टाळा. बचत: ₹180.`;
  }

  return advisory;
}

// ── Pest Risk Evaluation (mirrors pestWarningEngine.ts) ──

interface WeatherData {
  temp: number;
  humidity: number;
  rainfall: number;
  avgTemp?: number;
  rainMm?: number;
}

interface PestRiskResult {
  hasRisks: boolean;
  risks: string[];
  severity: string;
  advisory: string;
}

function evaluatePestRisks(
  daysSincePlanting: number,
  weather: WeatherData,
  currentMonth: number,
  variety: string,
): PestRiskResult | null {
  const risks: { name: string; level: string; treatment: string }[] = [];

  // Early Shoot Borer: day 15-90, temp 25-30, humidity >70, month 3-6
  if (
    daysSincePlanting >= 15 && daysSincePlanting <= 90 &&
    (weather.avgTemp ?? weather.temp) >= 25 && (weather.avgTemp ?? weather.temp) <= 30 &&
    weather.humidity > 70 &&
    currentMonth >= 3 && currentMonth <= 6
  ) {
    risks.push({ name: "लहान ठुमटी अळी", level: "high", treatment: "कार्टाप हायड्रोक्लोराइड 4% GR 10 किग्रॅ./एकर" });
  }

  // Red Rot: day >90, rain >50mm, humidity >85
  if (
    daysSincePlanting > 90 &&
    (weather.rainMm ?? weather.rainfall) > 50 &&
    weather.humidity > 85
  ) {
    risks.push({ name: "लाल रोट", level: "critical", treatment: "प्रतिबंधक फवारणी करा. रोगग्रस्त ऊस काढून टाका." });
  }

  // Smut: month 5-6 or 10-11, humidity >75
  if (
    ((currentMonth >= 5 && currentMonth <= 6) || (currentMonth >= 10 && currentMonth <= 11)) &&
    weather.humidity > 75
  ) {
    risks.push({ name: "कोळी रोग", level: "medium", treatment: "प्रोपिकोनाझोल 25% EC 400 मिली./एकर फवारणी" });
  }

  // Internode Borer / Top Borer: day >120, temp >28
  if (daysSincePlanting > 120 && (weather.avgTemp ?? weather.temp) > 28) {
    risks.push({ name: "आंतरगाठ अळी", level: "high", treatment: "कार्टाप हायड्रोक्लोराइड 4% GR 10 किग्रॅ./एकर" });
    risks.push({ name: "वरची खोड अळी", level: "high", treatment: "फ्लुबेंडामाइड 20% WG 100 ग्रॅ./एकर" });
  }

  // Wilt: day >10, days without irrigation >10, variety not Co0238
  if (daysSincePlanting > 10 && variety !== "Co0238") {
    risks.push({ name: "मर रोग", level: "medium", treatment: "ट्रायकोडर्मा विरिडी 2 किग्रॅ./एकर जमिनीत मिसळा" });
  }

  if (risks.length === 0) return null;

  const maxLevel = risks.reduce((max, r) => {
    const order = ["low", "medium", "high", "critical"];
    return order.indexOf(r.level) > order.indexOf(max) ? r.level : max;
  }, "low");

  return {
    hasRisks: true,
    risks: risks.map((r) => r.name),
    severity: maxLevel,
    advisory: risks[0].treatment,
  };
}

// ── Savings Calculator (mirrors savingsCalculator.ts) ──

const SAVINGS_EVENTS: Record<string, { amount: number; reason: string }> = {
  OPTIMAL_IRRIGATION: { amount: 180, reason: "इष्टतम सिंचनामुळे बचत" },
  RAIN_AVOIDED_IRRIGATION: { amount: 220, reason: "पावसामुळे सिंचन टाळले" },
  UREA_RAIN_DELAY: { amount: 400, reason: "पावसामुळे युरिया वापरणे टाळले" },
  PEST_WARNING_ACTED: { amount: 15000, reason: "कीड इशारानुसरून पीक वाचविले" },
};

function calculateSavings(
  durationMinutes: number,
  weather: WeatherData,
): { amount: number; reason: string } | null {
  if (durationMinutes >= 45 && durationMinutes <= 90) {
    return SAVINGS_EVENTS.OPTIMAL_IRRIGATION;
  }
  if ((weather.rainMm ?? weather.rainfall) > 30) {
    return SAVINGS_EVENTS.RAIN_AVOIDED_IRRIGATION;
  }
  return null;
}

// ── Weather Fetch ──

async function fetchWeatherForField(taluka: string, district: string): Promise<WeatherData> {
  const apiKey = Deno.env.get("OPENWEATHER_API_KEY");
  if (!apiKey) {
    return { temp: 28, humidity: 65, rainfall: 0, avgTemp: 28, rainMm: 0 };
  }
  try {
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
  } catch {
    return { temp: 28, humidity: 65, rainfall: 0, avgTemp: 28, rainMm: 0 };
  }
}

// ── Main Handler ──

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("sessionId is required");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch session with field and consumer data
    const { data: session, error: sessErr } = await supabase
      .from("water_sessions")
      .select("*, fields!inner(*, users!consumer_id(*))")
      .eq("id", sessionId)
      .single();

    if (sessErr || !session) throw new Error("Session not found");

    const field = session.fields;
    const consumer = field?.users;

    if (!field || !consumer) throw new Error("Field or consumer not linked");

    // Calculate days since planting
    const plantingDate = field.planting_date;
    const today = new Date();
    const daysSincePlanting = Math.floor((today.getTime() - new Date(plantingDate).getTime()) / 86_400_000);

    // Fetch weather for pest evaluation
    const weather = await fetchWeatherForField(field.village || "Kolhapur", field.district || "Kolhapur");

    // Calculate duration
    const startTime = session.actual_start_time ? new Date(session.actual_start_time) : new Date();
    const stopTime = session.actual_stop_time ? new Date(session.actual_stop_time) : new Date();
    const durationMinutes = Math.floor((stopTime.getTime() - startTime.getTime()) / 60_000);
    const timeOfDay = startTime.getHours() < 12 ? "morning" : startTime.getHours() < 17 ? "afternoon" : "evening";

    // Generate advisory using real engine logic
    const advisoryText = generateAdvisory(plantingDate, durationMinutes, timeOfDay);
    const growthStage = getGrowthStage(plantingDate);

    // Insert crop_advisory
    const { data: advisory, error: advErr } = await supabase
      .from("crop_advisories")
      .insert({
        session_id: sessionId,
        consumer_id: consumer.id,
        field_id: field.id,
        growth_stage: growthStage.stage,
        duration_category: durationMinutes < 45 ? "insufficient" : durationMinutes <= 90 ? "optimal" : "excess",
        time_of_day_category: timeOfDay,
        advisory_marathi: advisoryText,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (advErr) console.error("Advisory insert error:", advErr);

    // Pest check using real disease rules
    const currentMonth = today.getMonth() + 1;
    const pestResult = evaluatePestRisks(daysSincePlanting, weather, currentMonth, field.sugarcane_variety || "Co86032");
    if (pestResult?.hasRisks) {
      await supabase.from("pest_alerts").insert({
        consumer_id: consumer.id,
        field_id: field.id,
        pest_type: pestResult.risks[0],
        risk_level: pestResult.severity,
        trigger_reason: pestResult.advisory,
        weather_data: weather,
        advisory_marathi: pestResult.advisory,
        created_at: new Date().toISOString(),
      });
    }

    // Savings check using real savings calculator
    const savingsResult = calculateSavings(durationMinutes, weather);
    if (savingsResult) {
      await supabase.from("savings_log").insert({
        consumer_id: consumer.id,
        field_id: field.id,
        amount_saved: savingsResult.amount,
        reason: savingsResult.reason,
        reason_marathi: savingsResult.reason,
        session_id: sessionId,
        created_at: new Date().toISOString(),
      });
    }

    // Mark advisory generated
    await supabase
      .from("water_sessions")
      .update({
        advisory_generated: true,
        duration_minutes: durationMinutes,
        growth_stage: growthStage.stage,
        water_sufficiency: durationMinutes < 45 ? "insufficient" : durationMinutes <= 90 ? "optimal" : "excess",
      })
      .eq("id", sessionId);

    return new Response(JSON.stringify({ success: true, advisory }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
