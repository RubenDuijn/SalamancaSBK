import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type CreateStudentPayload = {
  email: string;
  password: string;
  full_name: string;
  level: string;
  style_levels?: Record<string, string>;
};

const allowedLevels = new Set([
  "beginner",
  "intermediate_1",
  "intermediate_2",
  "intermediate_3",
  "advanced_1",
  "advanced_2",
  "advanced_3",
]);

const allowedStyles = new Set(["salsa", "bachata", "kizomba", "tango", "zouk", "forro"]);

function sanitizeStyleLevels(input: Record<string, string> | undefined) {
  const styleLevels: Record<string, string> = {};

  Object.entries(input || {}).forEach(([style, level]) => {
    const styleKey = String(style || "").toLowerCase().trim();
    const levelSlug = String(level || "").trim();

    if (!allowedStyles.has(styleKey)) {
      return;
    }

    if (!allowedLevels.has(levelSlug)) {
      return;
    }

    styleLevels[styleKey] = levelSlug;
  });

  return styleLevels;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase environment variables" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing bearer token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const {
      data: { user: callerUser },
      error: callerError,
    } = await callerClient.auth.getUser();

    if (callerError || !callerUser) {
      return new Response(JSON.stringify({ error: "Invalid caller session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: callerProfile, error: profileError } = await callerClient
      .from("profiles")
      .select("role")
      .eq("id", callerUser.id)
      .single();

    if (profileError || !callerProfile || callerProfile.role !== "admin") {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = (await req.json()) as CreateStudentPayload;
    const email = String(payload.email || "").trim().toLowerCase();
    const password = String(payload.password || "");
    const fullName = String(payload.full_name || "").trim();
    const level = String(payload.level || "").trim();
    const styleLevels = sanitizeStyleLevels(payload.style_levels);

    if (!email || !password || !fullName) {
      return new Response(JSON.stringify({ error: "email, password, and full_name are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!allowedLevels.has(level)) {
      return new Response(JSON.stringify({ error: "Invalid level" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data: createdAuth, error: createAuthError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (createAuthError || !createdAuth.user) {
      return new Response(JSON.stringify({ error: createAuthError?.message || "Could not create auth user" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const studentId = createdAuth.user.id;

    const { error: profileUpsertError } = await adminClient
      .from("profiles")
      .upsert(
        {
          id: studentId,
          full_name: fullName,
          email,
          level,
          role: "member",
        },
        { onConflict: "id" }
      );

    if (profileUpsertError) {
      return new Response(JSON.stringify({ error: profileUpsertError.message || "Could not upsert profile" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const styleRows = Object.entries(styleLevels).map(([style_key, level_slug]) => ({
      student_id: studentId,
      style_key,
      level_slug,
    }));

    if (styleRows.length > 0) {
      const { error: styleUpsertError } = await adminClient
        .from("student_style_levels")
        .upsert(styleRows, { onConflict: "student_id,style_key" });

      if (styleUpsertError) {
        return new Response(JSON.stringify({ error: styleUpsertError.message || "Could not upsert style levels" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ ok: true, student_id: studentId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
