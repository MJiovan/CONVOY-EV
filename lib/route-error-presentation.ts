export interface RouteErrorPresentation {
  title: string;
  message: string;
  nextStep: string;
}

export function getRouteErrorPresentation(code: string, fallbackMessage: string): RouteErrorPresentation {
  switch (code) {
    case "ROUTING_NOT_CONFIGURED":
      return {
        title: "Real-world routing is not configured",
        message: fallbackMessage,
        nextStep: "Use the clearly labeled demo route for this prototype, or try again after the routing key is configured.",
      };
    case "ROUTING_OFFLINE":
      return {
        title: "We could not reach the routing service",
        message: fallbackMessage,
        nextStep: "Check your internet connection and try again, or continue with the clearly labeled demo route.",
      };
    case "ROUTING_AUTH_FAILED":
      return {
        title: "The routing service needs attention",
        message: fallbackMessage,
        nextStep: "The project owner needs to correct the routing API key. You can still use the demo route.",
      };
    case "LOCATION_NOT_FOUND":
    case "GEOCODING_FAILED":
      return {
        title: "We could not find one of those locations",
        message: fallbackMessage,
        nextStep: "Add a city and state, province, or ZIP/postal code, then try again.",
      };
    case "ROUTE_TOO_LONG":
      return {
        title: "This route is too long for one plan",
        message: fallbackMessage,
        nextStep: "Split the trip into shorter sections and create a plan for each section.",
      };
    default:
      return {
        title: "A real road route could not be created",
        message: fallbackMessage,
        nextStep: "Try again in a moment, or continue with the clearly labeled demo route.",
      };
  }
}
