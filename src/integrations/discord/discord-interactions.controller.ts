import type { RawBodyRequest } from "@nestjs/common";
import { BadRequestException, Controller, Headers, Logger, Post, Req, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { verifyKey } from "discord-interactions";
import type { Request } from "express";
import { DiscordInteractionHandler } from "./discord-interaction.handler";
import type { DiscordInteractionPayload, DiscordInteractionResponse } from "./discord.types";

@Controller("interactions")
export class DiscordInteractionsController {
  private readonly logger = new Logger(DiscordInteractionsController.name);

  constructor(
    private readonly config: ConfigService,
    private readonly interactionHandler: DiscordInteractionHandler,
  ) {}

  @Post()
  async handleInteraction(
    @Req() req: RawBodyRequest<Request>,
    @Headers("X-Signature-Ed25519") signature: string | undefined,
    @Headers("X-Signature-Timestamp") timestamp: string | undefined,
  ): Promise<DiscordInteractionResponse> {
    const rawBody = req.rawBody;
    if (!rawBody?.length) {
      throw new BadRequestException("Missing body");
    }

    const publicKey = this.config.get<string>("DISCORD_PUBLIC_KEY");
    if (!publicKey?.length) {
      this.logger.error("DISCORD_PUBLIC_KEY is not set");
      throw new UnauthorizedException("Server misconfiguration");
    }

    if (!signature?.length || !timestamp?.length) {
      throw new UnauthorizedException("Missing signature headers");
    }

    const isValid = await verifyKey(rawBody, signature, timestamp, publicKey);
    if (!isValid) {
      throw new UnauthorizedException("Bad request signature");
    }

    const body = req.body as DiscordInteractionPayload;
    if (!body || typeof body.type !== "number" || !body.token) {
      throw new BadRequestException("Invalid interaction payload");
    }

    try {
      return await this.interactionHandler.handle(body);
    } catch (error) {
      this.logger.error("Interaction handler error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        type: 4,
        data: {
          content: "Ocorreu um erro ao processar a interação. Tente novamente.",
          flags: 64,
        },
      };
    }
  }
}
