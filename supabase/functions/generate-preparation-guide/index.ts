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

    const stageInfo = currentStage ? ` They are at the "${currentStage}" stage.` : "";

    const systemPrompts: Record<string, string> = {
      parent: `You are a knowledgeable friend who has been through the California dependency court system and come out the other side. You talk to people like a real person — warm, direct, and honest. You never use bullet points, headers, bold text, or any formatting. Just write naturally like you're talking to someone. Keep it short — 4 to 6 sentences total. You know the system well but you're not a lawyer, and you always mention that their attorney is the right person for legal questions. Plain language only, 7th grade reading level.`,

      youth: `You are someone who was in foster care and understands what it's like. You talk to young people like a real person — not a counselor, not a system worker. Direct, honest, and on their side. No bullet points, no headers, no bold text. Just write naturally like you're texting a friend who trusts you. Keep it short — 4 to 6 sentences. Remind them that their lawyer works for them and they can ask anything.`,

      supporter: `You are a practical friend helping someone who is supporting a parent or youth in the California dependency system. You talk like a real person — clear, direct, brief. No bullet points, no headers, no bold text. Just write naturally. Keep it short — 4 to 6 sentences. Focus on what they can actually do. Note that the person they are helping should talk to their own attorney.`,
    };

    const buildPrompt = () => {
      const role = userRole as string;
      const stg = stageInfo;

      if (prepType === "hearing") {
        if (role === "youth") {
          return `A young person in foster care is getting ready for court.${stg} They said: "${concerns}"\n\nRespond as a friend who has been through it. Acknowledge how they feel, tell them one or two things that actually help at court, and remind them their lawyer is there for them. Write like you're talking to them directly, in plain sentences. No lists or formatting.`;
        }
        if (role === "supporter") {
          return `Someone is helping a parent or youth prepare for a dependency court hearing.${stg} They said: "${concerns}"\n\nRespond like a knowledgeable friend. Tell them one thing they can do right now to help, and remind them not to give legal advice — that's what the attorney is for. Plain sentences, no lists.`;
        }
        return `A parent in California dependency court has a hearing coming up.${stg} They said: "${concerns}"\n\nRespond like a friend who has been through the system. What should they focus on? What's one thing to tell their attorney before they go in? Keep it real and brief. Plain sentences only, no formatting.`;
      }

      if (prepType === "meeting") {
        if (role === "youth") {
          return `A young person has a meeting coming up related to their case.${stg} They said: "${concerns}"\n\nRespond like a friend. Validate how they feel about the meeting, tell them a couple things they can actually say or ask, and remind them they can have their lawyer present. Plain sentences, no formatting.`;
        }
        if (role === "supporter") {
          return `Someone is helping a person they care about prepare for a meeting in a dependency case.${stg} They said: "${concerns}"\n\nRespond like a knowledgeable friend. Tell them how to be helpful without taking over, and what to do after. Plain sentences, no formatting.`;
        }
        return `A parent in California dependency court is getting ready for a meeting with a professional.${stg} They said: "${concerns}"\n\nRespond like a friend who knows the system. What should they think about before the meeting? What's worth saying while they're there? Keep it brief and real. Plain sentences, no formatting.`;
      }

      if (prepType === "after_hearing") {
        if (role === "youth") {
          return `A young person just got out of court.${stg} They said: "${concerns}"\n\nRespond like a friend. Acknowledge that court is hard. Tell them what to do next and remind them their lawyer can explain what the judge said. Plain sentences, no formatting.`;
        }
        if (role === "supporter") {
          return `Someone just helped a parent or youth through a court hearing.${stg} They said: "${concerns}"\n\nRespond like a knowledgeable friend. How should they check in with the person? What's one practical next step? Plain sentences, no formatting.`;
        }
        return `A parent just finished a court hearing.${stg} They said: "${concerns}"\n\nRespond like a friend who has been through it. Put what happened in plain terms, tell them the most important next steps, and leave them with something true and encouraging. Keep it short — they're probably tired. Plain sentences, no formatting.`;
      }

      return `A ${role} in California dependency court needs help.${stg} They said: "${concerns}"\n\nRespond like a knowledgeable friend. Be brief, real, and supportive. Plain sentences, no formatting.`;
    };

    const systemPrompt = systemPrompts[userRole] || systemPrompts["parent"];
    const userPrompt = buildPrompt();

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
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        temperature: 0.6,
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
    // Strip any markdown formatting that slips through
    let generatedContent = anthropicData.content[0].text as string;
    generatedContent = generatedContent
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/#{1,6}\s+/g, '')
      .replace(/^\s*[-•]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      .trim();

    return new Response(
      JSON.stringify({ response: generatedContent }),
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
