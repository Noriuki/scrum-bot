import { IsBoolean, IsOptional } from "class-validator";

export class UpdateVoteDto {
  @IsOptional()
  @IsBoolean()
  revealed?: boolean;
}
