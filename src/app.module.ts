import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HealthModule } from "./common/health/health.module";
import { DiscordModule } from "./integrations/discord/discord.module";
import { SessionModule } from "./modules/session/session.module";
import { StoryModule } from "./modules/story/story.module";
import { UserModule } from "./modules/user/user.module";
import { VoteModule } from "./modules/vote/vote.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        name: "default",
        ttl: 60_000, // 1 minute
        limit: 120, // 120 requests per minute per IP (interactions + health, etc.)
      },
    ]),
    HealthModule,
    DiscordModule,
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        url: config.getOrThrow<string>("DATABASE_URL"),
        autoLoadEntities: true,
        synchronize: config.get<string>("NODE_ENV") !== "production",
      }),
      inject: [ConfigService],
    }),
    UserModule,
    SessionModule,
    StoryModule,
    VoteModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
