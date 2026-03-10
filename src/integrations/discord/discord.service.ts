// Packages
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

// Constants
import { DISCORD_API_BASE, DISCORD_ENDPOINTS } from "./discord.constants";

// Types
import type { DiscordInteractionCallbackBody, DiscordRequestOptions, DiscordSendMessageOptions } from "./discord.types";

@Injectable()
export class DiscordService {
  private readonly token: string;
  private readonly baseUrl: string;
  private readonly timeoutMs = 30_000;
  private readonly logger = new Logger(DiscordService.name);

  constructor(private readonly config: ConfigService) {
    const token = this.config.get<string>("DISCORD_BOT_TOKEN");
    const baseUrl = this.config.get<string>("DISCORD_API_BASE") || DISCORD_API_BASE;

    if (!baseUrl) {
      throw new Error("DISCORD_API_BASE is not set");
    }

    if (!token) {
      throw new Error("DISCORD_BOT_TOKEN is not set");
    }

    this.token = token;
    this.baseUrl = baseUrl;
  }

  protected async request<T>(method: string, path: string, options: DiscordRequestOptions = {}): Promise<T | null> {
    const url = `${this.baseUrl}${path}`;

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

  async sendChannelMessage(channelId: string, options: DiscordSendMessageOptions): Promise<{ id: string } | null> {
    return this.request<{ id: string }>("POST", DISCORD_ENDPOINTS.CHANNEL_MESSAGES(channelId), {
      body: options,
    });
  }

  async sendInteractionFollowUp(
    applicationId: string,
    interactionToken: string,
    body: DiscordSendMessageOptions,
  ): Promise<unknown> {
    return this.request<unknown>("POST", DISCORD_ENDPOINTS.WEBHOOK_FOLLOWUP(applicationId, interactionToken), { body });
  }

  async postInteractionCallback(
    interactionId: string,
    interactionToken: string,
    body: DiscordInteractionCallbackBody,
  ): Promise<unknown> {
    return this.request<unknown>("POST", DISCORD_ENDPOINTS.INTERACTION_CALLBACK(interactionId, interactionToken), {
      body,
    });
  }
}
