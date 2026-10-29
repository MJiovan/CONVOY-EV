declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    OPENROUTESERVICE_API_KEY?: string;
  }
}
