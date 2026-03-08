import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async create(dto: CreateUserDto) {
    const user = this.repo.create(dto);
    return this.repo.save(user);
  }

  async findOne(id: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async findByDiscordId(discordId: string): Promise<User | null> {
    return this.repo.findOne({ where: { discordId } });
  }

  /** Get or create user from Discord id and optional display name. */
  async findOrCreateFromDiscord(
    discordId: string,
    name?: string | null,
  ): Promise<User> {
    let user = await this.findByDiscordId(discordId);
    if (user) {
      if (name != null && user.name !== name) {
        await this.repo.update(user.id, { name });
        user = await this.findOne(user.id);
      }
      return user!;
    }
    const created = this.repo.create({ discordId, name: name ?? null });
    return this.repo.save(created);
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    await this.repo.update(id, dto as Partial<User>);
    return this.findOne(id);
  }
}
