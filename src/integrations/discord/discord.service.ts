import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DISCORD_API_BASE, DISCORD_ENDPOINTS } from "./discord.constants";
import type { DiscordInteractionCallbackBody } from "./discord.types";

/** Options for sending a message to a Discord channel */
export interface DiscordSendMessageOptions {
  content?: string;
  embeds?: unknown[];
  components?: unknown[];
}

/**
 * Discord REST API client.
 * Uses DISCORD_BOT_TOKEN from env.
 */
@Injectable()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name);
  private readonly token: string;
  private readonly baseUrl: string;
  private readonly timeoutMs = 30_000;

  constructor(private readonly config: ConfigService) {
    const token = this.config.get<string>("DISCORD_BOT_TOKEN");
    if (!token?.length) {
      this.logger.warn("DISCORD_BOT_TOKEN is not set; Discord API calls will fail.");
    }
    this.token = token ?? "";
    this.baseUrl = this.config.get<string>("DISCORD_API_BASE") ?? DISCORD_API_BASE;
  }

  protected async request<T>(
    method: string,
    path: string,
    options: { body?: unknown; query?: Record<string, string> } = {},
  ): Promise<T | null> {
    const url = path.startsWith("http") ? path : `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      Authorization: `Bot ${this.token}`,
      "Content-Type": "application/json",
    };

    try {
      const init: RequestInit = {
        method,
        headers,
        signal: AbortSignal.timeout(this.timeoutMs),
      };
      if (options.body !== undefined) {
        init.body = JSON.stringify(options.body);
      }
      const response = await fetch(url, init);
      const text = await response.text();
      const data = text ? (JSON.parse(text) as T) : null;

      if (!response.ok) {
        this.logger.warn(`Discord API error ${method} ${path}`, {
          status: response.status,
          body: data,
        });
        return null;
      }
      return data;
    } catch (error) {
      this.logger.error(`Discord API exception ${method} ${path}`, {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  async getBotUser(): Promise<{ id: string; username: string } | null> {
    return this.request<{ id: string; username: string }>("GET", DISCORD_ENDPOINTS.CURRENT_USER);
  }

  async sendChannelMessage(
    channelId: string,
    options: DiscordSendMessageOptions,
  ): Promise<{ id: string } | null> {
    return this.request<{ id: string }>("POST", DISCORD_ENDPOINTS.CHANNEL_MESSAGES(channelId), {
      body: options,
    });
  }

  async sendInteractionFollowUp(
    applicationId: string,
    interactionToken: string,
    body: DiscordSendMessageOptions,
  ): Promise<unknown> {
    return this.request<unknown>(
      "POST",
      DISCORD_ENDPOINTS.WEBHOOK_FOLLOWUP(applicationId, interactionToken),
      { body },
    );
  }

  async postInteractionCallback(
    interactionId: string,
    interactionToken: string,
    body: DiscordInteractionCallbackBody,
  ): Promise<unknown> {
    return this.request<unknown>(
      "POST",
      DISCORD_ENDPOINTS.INTERACTION_CALLBACK(interactionId, interactionToken),
      { body },
    );
  }
}
