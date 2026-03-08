import { IsInt, IsUUID, Min } from "class-validator";

export class CreateVoteDto {
  @IsUUID()
  storyId: string;

  @IsUUID()
  userId: string;

  @IsInt()
  @Min(0)
  value: number;
}
