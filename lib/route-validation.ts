export class RouteValidationError extends Error {
  constructor(message: string, readonly code: string) {
    super(message);
    this.name = "RouteValidationError";
  }
}

export function validateRouteRequest(value: { originLabel?: unknown; destinationLabel?: unknown }) {
  const originLabel = typeof value.originLabel === "string" ? value.originLabel.trim() : "";
  const destinationLabel = typeof value.destinationLabel === "string" ? value.destinationLabel.trim() : "";
  if (!originLabel || !destinationLabel) {
    throw new RouteValidationError("Enter both a starting location and destination.", "MISSING_LOCATION");
  }
  if (originLabel.length > 200 || destinationLabel.length > 200) {
    throw new RouteValidationError("Locations must be 200 characters or fewer.", "LOCATION_TOO_LONG");
  }
  const normalizedOrigin = normalizeLocation(originLabel);
  const normalizedDestination = normalizeLocation(destinationLabel);
  if (normalizedOrigin && normalizedDestination && normalizedOrigin === normalizedDestination) {
    throw new RouteValidationError("Starting location and destination must be different.", "SAME_LOCATION");
  }
  return { originLabel, destinationLabel };
}

function normalizeLocation(value: string) {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
