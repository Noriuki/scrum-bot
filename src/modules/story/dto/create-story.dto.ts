import { IsOptional, IsString, IsUUID } from "class-validator";

export class CreateStoryDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  sessionId: string;
}
