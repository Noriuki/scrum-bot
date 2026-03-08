import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Vote } from "./entities/vote.entity";
import { VoteService } from "./vote.service";

@Module({
  imports: [TypeOrmModule.forFeature([Vote])],
  providers: [VoteService],
  exports: [VoteService],
})
export class VoteModule {}
