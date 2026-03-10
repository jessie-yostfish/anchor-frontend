import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  prepType: string;
  concerns: string;
  currentStage?: string;
  userRole?: string;
  messages?: Array<{ role: string; content: string }>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { prepType, concerns, currentStage, userRole = "parent", messages }: RequestBody = await req.json();

    if (!prepType || !concerns) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicApiKey) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stageInfo = currentStage ? ` The case is currently at the "${currentStage}" stage.` : "";

    // ── ROLE-SPECIFIC SYSTEM PROMPTS ────────────────────────────────────────
    const systemPrompts: Record<string, string> = {
      parent: `You are a warm, supportive guide helping parents navigate California dependency court. You speak plainly, at a 7th grade reading level. You are trauma-informed — you know people come to you when they are scared and overwhelmed. Keep responses SHORT (3-5 sentences per section, max). Never use legal jargon without explaining it. Always end with one sentence reminding them to talk to their attorney. You are not a lawyer.`,

      youth: `You are a supportive, trustworthy guide for a young person involved in California dependency court. You speak directly to them like a caring adult who is on their side. Keep it short, simple, and real — no walls of text. Use "you" language. Validate their feelings first. Never talk down to them. You are not a lawyer — remind them their attorney is there to help.`,

      supporter: `You are a helpful guide for someone supporting a parent or youth through California dependency court. They are not the one on the case — they want to help someone they care about. Be practical and brief. Focus on what they can actually do. Keep responses short and clear. Remind them that the person they are supporting should talk to their own attorney.`,
    };

    // ── ROLE-SPECIFIC USER PROMPTS ───────────────────────────────────────────
    const buildPrompt = () => {
      const role = userRole as string;
      const stg = stageInfo;

      if (prepType === "hearing") {
        if (role === "youth") {
          return `A young person in foster care is getting ready for court.${stg} They said: "${concerns}"

Give them 3 things:
1. One sentence acknowledging how they feel
2. 2-3 short bullet points: what to say or do at court
3. One reminder that their lawyer is on their side and they can ask them anything

Keep it warm, short, and real. No headers needed — just speak to them directly.`;
        }
        if (role === "supporter") {
          return `Someone is helping a parent or youth prepare for a court hearing.${stg} Their concern: "${concerns}"

Give them 3 short things:
1. One thing they can do right now to help
2. 2-3 ways to support the person emotionally on court day
3. One thing they should NOT do (like give legal advice)

Keep it brief and practical.`;
        }
        // parent
        return `A parent in California dependency court has a hearing coming up.${stg} Their concern: "${concerns}"

Give them exactly 3 short sections:
1. **What to focus on** — 2-3 bullet points of what to say or bring
2. **One question to ask their attorney** before the hearing
3. **One sentence of encouragement**

Keep each section SHORT. Plain language only. No jargon.`;
      }

      if (prepType === "meeting") {
        if (role === "youth") {
          return `A young person is preparing for a meeting with someone on their case.${stg} They said: "${concerns}"

Give them:
1. One sentence validating their feelings about this meeting
2. 2-3 things they can say or ask in the meeting
3. A reminder that they are allowed to have their own lawyer present

Short and simple — speak directly to them.`;
        }
        if (role === "supporter") {
          return `Someone is helping prepare for a meeting related to a dependency case.${stg} Concern: "${concerns}"

Give them 3 short practical things:
1. How to be supportive without taking over
2. One question they can help the other person think about ahead of time
3. What to do after the meeting

Brief and practical only.`;
        }
        // parent
        return `A parent in California dependency court is preparing for a professional meeting.${stg} They want to discuss: "${concerns}"

Give them exactly 3 things:
1. **Before the meeting** — 2 things to prepare or write down
2. **During the meeting** — 2 short things to say or ask
3. **After the meeting** — 1 action to take

Plain language. Short. Supportive tone.`;
      }

      if (prepType === "after_hearing") {
        if (role === "youth") {
          return `A young person just got out of court.${stg} They said: "${concerns}"

Give them:
1. One sentence acknowledging that court is hard and their feelings make sense
2. 2-3 short things to do or think about next
3. One reminder that their lawyer can answer questions about what the judge said

Keep it warm and short.`;
        }
        if (role === "supporter") {
          return `Someone just supported a parent or youth through a court hearing.${stg} Concern: "${concerns}"

Give them 3 short things:
1. How to check in emotionally with the person after court
2. One practical next step to help with
3. A reminder to encourage them to follow up with their attorney

Brief only.`;
        }
        // parent
        return `A parent just finished a court hearing.${stg} They said: "${concerns}"

Give them exactly 3 things:
1. **What likely just happened** — 1-2 sentences putting it in plain language
2. **Your 2 most important next steps** — concrete and specific
3. **One thing to hold onto** — an encouraging sentence

Keep it short. They are probably exhausted.`;
      }

      // fallback
      return `A ${role} in California dependency court needs help.${stg} They said: "${concerns}"\n\nGive them 3 short, practical, supportive sentences. Plain language only.`;
    };

    const systemPrompt = systemPrompts[userRole] || systemPrompts["parent"];
    const userPrompt = buildPrompt();

    // Build messages array — support follow-up chat
    let apiMessages: Array<{ role: string; content: string }>;
    if (messages && messages.length > 0) {
      apiMessages = messages;
    } else {
      apiMessages = [{ role: "user", content: userPrompt }];
    }

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",  // Haiku: much faster, still good quality
        max_tokens: 600,                      // Short responses only
        temperature: 0.5,
        system: systemPrompt,
        messages: apiMessages,
      }),
    });

    if (!anthropicResponse.ok) {
      const errorData = await anthropicResponse.text();
      console.error("Anthropic API error:", errorData);
      return new Response(
        JSON.stringify({ error: "Failed to generate guidance" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const anthropicData = await anthropicResponse.json();
    const generatedContent = anthropicData.content[0].text;

    return new Response(
      JSON.stringify({ response: generatedContent }),  // key is "response" to match frontend
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-preparation-guide:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
