// @ts-ignore - Deno runtime types
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @ts-ignore - Deno runtime types
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// @ts-ignore - Deno global
serve(async (req) => {
  const supa = createClient(
    // @ts-ignore - Deno global
    Deno.env.get("SUPABASE_URL")!,
    // @ts-ignore - Deno global
    Deno.env.get("SUPABASE_ANON_KEY")!, // uses caller's JWT via header
    { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
  );

  try {
    const { target_id, direction } = await req.json();
    if (!target_id || !["like","pass"].includes(direction)) {
      return new Response(JSON.stringify({ error: "bad_request" }), { status: 400 });
    }

    const { data: meRes, error: meErr } = await supa.auth.getUser();
    if (meErr || !meRes?.user) return new Response("unauthorized", { status: 401 });

    const me = meRes.user.id;

    const ins = await supa.from("swipes").insert({ swiper_id: me, target_id, direction });
    if (ins.error && !ins.error.message.includes("duplicate key")) {
      return new Response(JSON.stringify({ error: ins.error.message }), { status: 400 });
    }

    // Check for a match between me and target
    const { data: match } = await supa.from("matches")
      .select("*")
      .or(`and(user_a.eq.${me},user_b.eq.${target_id}),and(user_a.eq.${target_id},user_b.eq.${me})`)
      .maybeSingle();

    return new Response(JSON.stringify({ ok: true, match }), { headers: { "Content-Type": "application/json" }});
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
