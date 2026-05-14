// Placeholder Edge Function for Grab Express delivery booking.
// This is a scaffold — swap the mock response for real Grab Express API
// calls once production credentials are issued.
//
// Docs (when available): https://developer.grab.com/docs/grab-express-api/

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface GrabBookingRequest {
  order_id: string;
  pickup_address: string;
  drop_address: string;
  recipient_name: string;
  recipient_phone: string;
  package_value?: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as GrabBookingRequest;

    // TODO: Replace with real Grab Express API call once credentials exist:
    //
    // const grabRes = await fetch("https://partner-api.grab.com/grabexpress/v1/deliveries", {
    //   method: "POST",
    //   headers: {
    //     Authorization: `Bearer ${Deno.env.get("GRAB_API_KEY")}`,
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ /* mapped payload */ }),
    // });

    const trackingId = `GRAB-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    return new Response(
      JSON.stringify({
        success: true,
        tracking_id: trackingId,
        status: "searching_driver",
        eta_minutes: 35,
        order_id: body.order_id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: (err as Error).message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
