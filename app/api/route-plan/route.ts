import { env } from "cloudflare:workers";
import { OpenRouteServiceApiError, planOpenRouteServiceRoute } from "@/lib/openrouteservice";
import { RouteValidationError, validateRouteRequest } from "@/lib/route-validation";

export async function POST(request: Request) {
  const body = await readBody(request);
  if (body instanceof RouteValidationError) return Response.json({ code: body.code, message: body.message }, { status: 400 });

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
    return validateRouteRequest(value);
  } catch (error) {
    return error instanceof RouteValidationError ? error : new RouteValidationError("Enter both a starting location and destination.", "INVALID_REQUEST");
  }
}
