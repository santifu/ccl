import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Usa los secretos guardados en Supabase
const supabaseUrl = Deno.env.get("CCL_URL")!;
const supabaseKey = Deno.env.get("CCL_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  try {
    const { userId, projectTitle, yourName, levels, country, timestamp } = await req.json();

    const { data, error } = await supabase
      .from("badges")   // <-- cambiar a tu tabla
      .insert({
        user_id: userId,
        project_title: projectTitle,
        your_name: yourName,
        levels,           // guardar JSON de niveles
        country,
        timestamp
      });

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    return new Response(JSON.stringify({ success: true, data }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
});