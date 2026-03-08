import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateStoryDto } from "./dto/create-story.dto";
import { UpdateStoryDto } from "./dto/update-story.dto";
import { Story } from "./entities/story.entity";

@Injectable()
export class StoryService {
  constructor(
    @InjectRepository(Story)
    private readonly repo: Repository<Story>,
  ) {}

  async create(dto: CreateStoryDto) {
    const story = this.repo.create(dto);
    return this.repo.save(story);
  }

  async findOne(id: string) {
    const story = await this.repo.findOne({
      where: { id },
      relations: { session: true },
    });
    if (!story) throw new NotFoundException("Story not found");
    return story;
  }

  /** Returns story with session, or null if not found. Use for channel validation. */
  async findOneWithSession(id: string): Promise<Story | null> {
    return this.repo.findOne({
      where: { id },
      relations: { session: true },
    });
  }

  async update(id: string, dto: UpdateStoryDto) {
    await this.findOne(id);
    await this.repo.update(id, dto as Partial<Story>);
    return this.findOne(id);
  }

  async findBySessionId(sessionId: string) {
    return this.repo.find({
      where: { sessionId },
      order: { createdAt: "DESC" },
    });
  }

  async findLatestBySessionId(sessionId: string) {
    const [latest] = await this.repo.find({
      where: { sessionId },
      order: { createdAt: "DESC" },
      take: 1,
    });
    return latest ?? null;
  }
}
