import Anthropic from "@anthropic-ai/sdk";

// Instantiate lazily so the key is read at request time, not module load time
let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

const PROMPT =
  "Count every individual piece of litter, trash, or waste visible in this image. " +
  "Only count clearly visible items (bottles, cans, cups, bags, wrappers, food containers, paper, etc.). " +
  'Reply with ONLY this JSON — no other text: {"total": 3}';

export async function claudeCountLitter(base64Image: string): Promise<{ count: number | null; error?: string }> {
  if (!process.env.ANTHROPIC_API_KEY) {
    const msg = "ANTHROPIC_API_KEY not set in .env.local";
    console.error("[claude-verify]", msg);
    return { count: null, error: msg };
  }
  console.log("[claude-verify] calling Claude, key prefix:", process.env.ANTHROPIC_API_KEY.slice(0, 24));

  const imageData = base64Image.replace(/^data:image\/[a-z+]+;base64,/, "");

  try {
    const msg = await getClient().messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 64,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data: imageData } },
          { type: "text", text: PROMPT },
        ],
      }],
    });

    const text = msg.content[0]?.type === "text" ? msg.content[0].text.trim() : "";
    console.log("[claude-verify] response:", text);

    const match = text.match(/"total"\s*:\s*(\d+)/);
    if (match) return { count: parseInt(match[1], 10) };

    const num = text.match(/\b(\d+)\b/);
    if (num) return { count: parseInt(num[1], 10) };

    const parseErr = `Could not parse count from: ${text}`;
    console.error("[claude-verify]", parseErr);
    return { count: null, error: parseErr };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("[claude-verify] API error:", errMsg);
    return { count: null, error: errMsg };
  }
}
