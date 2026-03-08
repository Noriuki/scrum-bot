import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Story } from "./entities/story.entity";
import { StoryService } from "./story.service";

@Module({
  imports: [TypeOrmModule.forFeature([Story])],
  providers: [StoryService],
  exports: [StoryService],
})
export class StoryModule {}
