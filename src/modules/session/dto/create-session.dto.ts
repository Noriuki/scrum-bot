import { IsOptional, IsString, IsUUID } from "class-validator";

export class CreateSessionDto {
  @IsString()
  title: string;

  @IsUUID()
  createdById: string;

  @IsOptional()
  @IsString()
  discordChannelId?: string;

  @IsOptional()
  @IsString()
  discordGuildId?: string;

  @IsOptional()
  @IsString()
  voteScale?: string;
}
