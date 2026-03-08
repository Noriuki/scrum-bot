import { IsOptional, IsString } from "class-validator";

export class CreateUserDto {
  @IsString()
  discordId: string;

  @IsOptional()
  @IsString()
  name?: string;
}
