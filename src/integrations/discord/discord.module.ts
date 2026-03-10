// Packages
import { Module } from "@nestjs/common";

// Modules
import { SessionModule } from "../../modules/session/session.module";
import { StoryModule } from "../../modules/story/story.module";
import { UserModule } from "../../modules/user/user.module";
import { VoteModule } from "../../modules/vote/vote.module";

// Controllers
import { DiscordInteractionsController } from "./discord-interactions.controller.js";

// Handlers
import { DiscordInteractionHandler } from "./discord-interaction.handler.js";

// Services
import { DiscordService } from "./discord.service.js";

@Module({
  imports: [UserModule, SessionModule, StoryModule, VoteModule],
  controllers: [DiscordInteractionsController],
  providers: [DiscordService, DiscordInteractionHandler],
  exports: [DiscordService],
})
export class DiscordModule {}
