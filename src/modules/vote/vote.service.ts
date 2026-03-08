import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateVoteDto } from "./dto/create-vote.dto";
import { UpdateVoteDto } from "./dto/update-vote.dto";
import { Vote } from "./entities/vote.entity";

@Injectable()
export class VoteService {
  constructor(
    @InjectRepository(Vote)
    private readonly repo: Repository<Vote>,
  ) {}

  async create(dto: CreateVoteDto) {
    const vote = this.repo.create(dto);
    return this.repo.save(vote);
  }

  async findOne(id: string) {
    const vote = await this.repo.findOne({
      where: { id },
      relations: { story: true, user: true },
    });
    if (!vote) throw new NotFoundException("Vote not found");
    return vote;
  }

  async update(id: string, dto: UpdateVoteDto) {
    await this.findOne(id);
    await this.repo.update(id, dto as Partial<Vote>);
    return this.findOne(id);
  }

  async findByStoryId(storyId: string) {
    return this.repo.find({
      where: { storyId },
      relations: { user: true },
    });
  }

  async findVote(storyId: string, userId: string): Promise<Vote | null> {
    return this.repo.findOne({ where: { storyId, userId } });
  }

  /** Create or update vote for story+user; value -1 can mean "?" (abstain). */
  async upsertVote(storyId: string, userId: string, value: number): Promise<Vote> {
    const existing = await this.findVote(storyId, userId);
    if (existing) {
      await this.repo.update(existing.id, { value });
      const updated = await this.repo.findOne({
        where: { id: existing.id },
        relations: { user: true },
      });
      if (!updated) throw new NotFoundException("Vote not found");
      return updated;
    }
    const vote = this.repo.create({ storyId, userId, value });
    return this.repo.save(vote);
  }

  async setRevealedForStory(storyId: string): Promise<void> {
    await this.repo.update({ storyId }, { revealed: true });
  }

  async getRevealedVotes(storyId: string) {
    return this.repo.find({
      where: { storyId, revealed: true },
      relations: { user: true },
    });
  }
}
