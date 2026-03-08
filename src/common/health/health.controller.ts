import { Controller, Get } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";

/**
 * Health check for load balancers, Docker and orchestrators.
 * GET /api/health returns 200 when the app is up.
 * Skipped by rate limit so probes are not counted.
 */
@SkipThrottle()
@Controller("health")
export class HealthController {
  @Get()
  check(): { status: string } {
    return { status: "ok" };
  }
}
