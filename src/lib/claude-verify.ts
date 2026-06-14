import Anthropic from "@anthropic-ai/sdk";

// Instantiate lazily so the key is read at request time, not module load time
let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

const COUNT_PROMPT =
  "Count every individual piece of litter, trash, or waste visible in this image. " +
  "Only count clearly visible items (bottles, cans, cups, bags, wrappers, food containers, paper, etc.). " +
  'Reply with ONLY this JSON — no other text: {"total": 3}';

const LOCATION_PROMPT =
  "You are shown two photos: a BEFORE photo (first image) and an AFTER photo (second image) from a litter cleanup. " +
  "Decide if these photos were taken in the same general location or nearby area. " +
  "Be VERY generous — answer SAME if the photos could plausibly be before/after shots of the same cleanup spot, " +
  "even if the camera angle, lighting, or framing is different. " +
  "Only answer DIFFERENT if the locations are OBVIOUSLY and completely unrelated " +
  "(e.g., one is clearly indoors and the other outdoors, or they show totally different environments like a beach vs a forest vs a city street). " +
  "When in doubt, always answer SAME. " +
  'Reply with ONLY this JSON — no other text: {"same": true}';

export async function claudeCountLitter(base64Image: string): Promise<{ count: number | null; error?: string }> {
  if (!process.env.ANTHROPIC_API_KEY) {
    const msg = "ANTHROPIC_API_KEY not set in .env.local";
    console.error("[claude-verify]", msg);
    return { count: null, error: msg };
  }
  console.log("[claude-verify] counting litter, key prefix:", process.env.ANTHROPIC_API_KEY.slice(0, 24));

  const imageData = base64Image.replace(/^data:image\/[a-z+]+;base64,/, "");

  try {
    const msg = await getClient().messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 64,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data: imageData } },
          { type: "text", text: COUNT_PROMPT },
        ],
      }],
    });

    const text = msg.content[0]?.type === "text" ? msg.content[0].text.trim() : "";
    console.log("[claude-verify] count response:", text);

    const match = text.match(/"total"\s*:\s*(\d+)/);
    if (match) return { count: parseInt(match[1], 10) };

    const num = text.match(/\b(\d+)\b/);
    if (num) return { count: parseInt(num[1], 10) };

    const parseErr = `Could not parse count from: ${text}`;
    console.error("[claude-verify]", parseErr);
    return { count: null, error: parseErr };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("[claude-verify] count API error:", errMsg);
    return { count: null, error: errMsg };
  }
}

// Returns true if photos are same/nearby location, false only if OBVIOUSLY different.
// Defaults to true on error (high tolerance — never block a valid submission due to API failure).
export async function claudeCheckSameLocation(beforeImage: string, afterImage: string): Promise<{ same: boolean; error?: string }> {
  if (!process.env.ANTHROPIC_API_KEY) return { same: true };

  const beforeData = beforeImage.replace(/^data:image\/[a-z+]+;base64,/, "");
  const afterData = afterImage.replace(/^data:image\/[a-z+]+;base64,/, "");

  try {
    const msg = await getClient().messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 32,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data: beforeData } },
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data: afterData } },
          { type: "text", text: LOCATION_PROMPT },
        ],
      }],
    });

    const text = msg.content[0]?.type === "text" ? msg.content[0].text.trim() : "";
    console.log("[claude-verify] location response:", text);

    // Parse {"same": false} or {"same": true}
    const match = text.match(/"same"\s*:\s*(true|false)/);
    if (match) return { same: match[1] === "true" };

    // Fallback: look for SAME/DIFFERENT keywords
    if (/\bDIFFERENT\b/i.test(text) && !/\bSAME\b/i.test(text)) return { same: false };

    // Default to same on parse failure — high tolerance
    return { same: true };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("[claude-verify] location API error:", errMsg);
    return { same: true, error: errMsg }; // default to allowing on error
  }
}
