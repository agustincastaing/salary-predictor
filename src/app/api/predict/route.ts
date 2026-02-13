import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { posting } = await req.json();

    if (!posting) {
      return new Response(JSON.stringify({ error: "No posting provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const prompt = buildPrompt(posting);

    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    console.error("Predict error:", error?.message || error);
    return new Response(JSON.stringify({ error: error?.message || "Prediction failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

function buildPrompt(posting: Record<string, any>): string {
  const compensation = posting.compensation?.compensationTierSummary;

  return `You are a compensation analyst. Predict the salary for this role.

Title: ${posting.title}
Department: ${posting.department || "N/A"}
Team: ${posting.team || "N/A"}
Location: ${posting.location || "N/A"}
Employment Type: ${posting.employmentType || "N/A"}
Remote: ${posting.isRemote ? "Yes" : "No"}
${compensation ? `Listed Compensation: ${compensation}` : "No compensation listed."}

Description:
${posting.descriptionPlain || posting.descriptionHtml || "N/A"}

Respond with:
1. **Predicted Salary Range** (min – max USD)
2. **Best Estimate** (single number)
3. **Explanation** — justify based on role level, location, skills, industry benchmarks.

Be specific and data-driven. Keep it concise.`;
}
