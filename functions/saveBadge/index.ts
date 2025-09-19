import { serve } from "https://deno.land/x/supabase_edge_functions@0.1.0/mod.ts";

serve(async (req) => {
  try {
    const body = await req.json();

    const { projectTitle, userName, country, phaseData } = body;

    // Conexión con Supabase
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm");
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Insertar en la tabla 'badges'
    const { data, error } = await supabase
      .from("badges")
      .insert([
        {
          project_title: projectTitle,
          user_name: userName,
          country,
          phase_data: phaseData,
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, data }), { status: 200 });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
});