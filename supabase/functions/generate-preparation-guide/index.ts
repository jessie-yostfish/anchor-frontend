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
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { prepType, concerns, currentStage }: RequestBody = await req.json();

    if (!prepType || !concerns) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: prepType and concerns" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicApiKey) {
      return new Response(
        JSON.stringify({ error: "Anthropic API key not configured" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const prepTypeMap: Record<string, string> = {
      hearing: "court hearing",
      meeting: "meeting with their attorney or social worker",
      after_hearing: "reflecting after a court hearing",
    };

    const hearingType = prepTypeMap[prepType] || "court event";
    const stageInfo = currentStage ? ` They are currently at the "${currentStage}" stage.` : "";

    const systemPrompt = `You are a compassionate, knowledgeable assistant helping parents navigate California dependency court. Your role is to provide trauma-informed, practical guidance that empowers parents while being clear this is educational information, not legal advice.

Key principles:
- Use supportive, respectful language that acknowledges the difficulty of their situation
- Be specific and actionable - provide concrete steps they can take
- Focus on what they CAN control and influence
- Acknowledge their concerns without dismissing them
- Keep language clear and accessible (avoid legal jargon when possible)
- Be realistic but encouraging

Always remind them to consult their attorney for advice specific to their case.`;

    const userPrompt = `A parent in California dependency court is preparing for a ${hearingType}.${stageInfo} Their specific concern is: "${concerns}"

Provide practical, trauma-informed preparation guidance including:
- Key points to make to the judge (or person they're meeting with)
- What documents or evidence to bring
- Questions to ask their attorney
- How to present themselves professionally and authentically
- What to expect at this hearing/meeting
- A sample opening statement or talking points they can adapt

Format your response in clear sections with headers. Use bullet points for lists. Keep the tone supportive but professional. This is educational information to help them prepare and advocate for themselves.

End with a reminder to consult their attorney for advice specific to their case.`;

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: userPrompt,
          },
        ],
      }),
    });

    if (!anthropicResponse.ok) {
      const errorData = await anthropicResponse.text();
      console.error("Anthropic API error:", errorData);
      return new Response(
        JSON.stringify({ error: "Failed to generate guidance from AI service" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const anthropicData = await anthropicResponse.json();
    const generatedContent = anthropicData.content[0].text;

    return new Response(
      JSON.stringify({
        content: generatedContent,
        model: "claude-sonnet-4-20250514",
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in generate-preparation-guide:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
