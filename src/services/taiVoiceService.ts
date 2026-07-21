import { supabase } from "../lib/supabase";

async function playTaiVoice(text: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke("tts-proxy", {
      body: { text },
    });

    if (error) {
      console.error("Tai voice error:", error.message);
      return null;
    }

    if (data instanceof Blob) {
      return URL.createObjectURL(data);
    }

    if (typeof data === "string") {
      return data;
    }

    return null;
  } catch (err) {
    console.error("Tai voice failed:", err);
    return null;
  }
}

async function playAdvisory(
  farmerName: string,
  durationMinutes: number,
  stageMarathi: string,
  sufficiency: "insufficient" | "optimal" | "overwatered",
): Promise<string | null> {
  let script: string;

  if (sufficiency === "optimal") {
    script = `${farmerName} काका, आज ${durationMinutes} मिनिटे पाणी दिलंत — सांगाड्याचं काम केलंत! ${stageMarathi} साठी हे एकदम योग्य आहे. शेत छान वाढतंय काका 🌾`;
  } else if (sufficiency === "insufficient") {
    script = `${farmerName} काका, आज पाण्याचा वेळ थोडा कमी झाला. जर शक्य असेल तर उद्या थोडं जास्त वेळ पाणी द्या. ऊस तहानलेला राहिला तर फुटवे कमी होतात काका.`;
  } else {
    script = `${farmerName} काका, आज पाणी जरा जास्त झालं. शेतात निचरा होतोय का ते पाहा. पुढच्या वेळी थोडा वेळ कमी ठेवा — मुळांना हवा लागते.`;
  }

  return playTaiVoice(script);
}

async function playMorningMessage(
  farmerName: string,
  dayNumber: number,
  stageMarathi: string,
  weather: string,
): Promise<string | null> {
  const script = `नमस्कार ${farmerName} काका! आज ${stageMarathi} तप्पा — तुमचा ऊस ${dayNumber} दिवसांचा आहे. आजचं हवामान: ${weather}. काही विशेष सल्ला असेल तर संध्याकाळी कळवते. शुभ दिन काका! 🙏`;
  return playTaiVoice(script);
}

export const taiVoiceService = {
  playTaiVoice,
  playAdvisory,
  playMorningMessage,
};
