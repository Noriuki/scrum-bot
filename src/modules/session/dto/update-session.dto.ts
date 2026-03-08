import { IsOptional, IsString } from "class-validator";

export class UpdateSessionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  discordChannelId?: string;

  @IsOptional()
  @IsString()
  discordGuildId?: string;
}
