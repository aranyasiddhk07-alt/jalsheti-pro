import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const TWILIO_SID = Deno.env.get("TWILIO_ACCOUNT_SID")!;
const TWILIO_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN")!;
const TWILIO_PHONE = Deno.env.get("TWILIO_PHONE_NUMBER")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { user, factor } = await req.json();
    const phone = user?.phone;
    const code = factor?.otp_code;

    if (!phone || !code) {
      return new Response(JSON.stringify({ error: "phone and code required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = new URLSearchParams();
    body.append("To", phone);
    body.append("From", TWILIO_PHONE);
    body.append("Body", `Your JalSheti Pro OTP is ${code}`);

    const resp = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Authorization": "Basic " + btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      },
    );

    const result = await resp.json();
    console.log("SMS sent:", result.sid);

    return new Response(JSON.stringify({ success: true, sid: result.sid }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("SMS hook error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
