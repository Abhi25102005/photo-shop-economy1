import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token_hash = url.searchParams.get("token_hash");
    const type = url.searchParams.get("type") || "signup";
    const redirect_to = url.searchParams.get("redirect_to") || "/";

    if (req.method === "GET" && token_hash) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

      const verifyUrl = `${supabaseUrl}/auth/v1/verify?token_hash=${encodeURIComponent(token_hash)}&type=${type}`;

      const verifyRes = await fetch(verifyUrl, {
        method: "GET",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        redirect: "manual",
      });

      const location = verifyRes.headers.get("location") || redirect_to;

      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          Location: location,
        },
      });
    }

    if (req.method === "POST") {
      const body = await req.json();
      const { email, user_id } = body;

      if (!email || !user_id) {
        return new Response(
          JSON.stringify({ error: "Missing email or user_id" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

      const adminRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${user_id}`, {
        method: "GET",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
      });

      const userData = await adminRes.json();

      if (userData.email_confirmed_at) {
        return new Response(
          JSON.stringify({ message: "Email already confirmed" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const confirmRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${user_id}`, {
        method: "PUT",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_confirm: true,
        }),
      });

      if (!confirmRes.ok) {
        const errData = await confirmRes.json();
        return new Response(
          JSON.stringify({ error: errData.msg || "Failed to confirm email" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ message: "Email confirmed successfully" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
