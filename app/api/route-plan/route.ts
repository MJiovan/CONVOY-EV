import { env } from "cloudflare:workers";
import { OpenRouteServiceApiError, planOpenRouteServiceRoute } from "@/lib/openrouteservice";

export async function POST(request: Request) {
  const body = await readBody(request);
  if (!body) return Response.json({ code: "INVALID_REQUEST", message: "Enter both a starting location and destination." }, { status: 400 });

  const apiKey = env.OPENROUTESERVICE_API_KEY || process.env.OPENROUTESERVICE_API_KEY;
  if (!apiKey) {
    return Response.json({
      code: "ROUTING_NOT_CONFIGURED",
      message: "Real-world routing is not configured yet. You can continue with the clearly labeled demo route.",
    }, { status: 503 });
  }

  try {
    const route = await planOpenRouteServiceRoute(body, apiKey);
    return Response.json({ route });
  } catch (error) {
    if (error instanceof OpenRouteServiceApiError) {
      return Response.json({ code: error.code, message: error.message }, { status: error.status });
    }
    return Response.json({ code: "ROUTING_FAILED", message: "Real-world routing is temporarily unavailable. You can continue with the demo route." }, { status: 502 });
  }
}

async function readBody(request: Request) {
  try {
    const value = await request.json() as { originLabel?: unknown; destinationLabel?: unknown };
    const originLabel = typeof value.originLabel === "string" ? value.originLabel.trim() : "";
    const destinationLabel = typeof value.destinationLabel === "string" ? value.destinationLabel.trim() : "";
    if (!originLabel || !destinationLabel || originLabel.length > 200 || destinationLabel.length > 200) return null;
    return { originLabel, destinationLabel };
  } catch { return null; }
}
