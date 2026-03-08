import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SESSION_STATUS } from "../../common/constants";
import { CreateSessionDto } from "./dto/create-session.dto";
import { UpdateSessionDto } from "./dto/update-session.dto";
import { Session } from "./entities/session.entity";

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private readonly repo: Repository<Session>,
  ) {}

  async create(dto: CreateSessionDto) {
    const session = this.repo.create(dto);
    return this.repo.save(session);
  }

  async findOne(id: string) {
    const session = await this.repo.findOne({
      where: { id },
      relations: { createdBy: true },
    });
    if (!session) throw new NotFoundException("Session not found");
    return session;
  }

  async update(id: string, dto: UpdateSessionDto) {
    await this.findOne(id);
    await this.repo.update(id, dto as Partial<Session>);
    return this.findOne(id);
  }

  async findByDiscordChannelId(channelId: string): Promise<Session | null> {
    const [session] = await this.repo.find({
      where: { discordChannelId: channelId },
      relations: { createdBy: true },
      order: { createdAt: "DESC" },
      take: 1,
    });
    return session ?? null;
  }

  /** Returns the open session in this channel, if any. Use for adding stories. */
  async findOpenByDiscordChannelId(channelId: string): Promise<Session | null> {
    const [session] = await this.repo.find({
      where: { discordChannelId: channelId, status: SESSION_STATUS.OPEN },
      relations: { createdBy: true },
      order: { createdAt: "DESC" },
      take: 1,
    });
    return session ?? null;
  }
}
