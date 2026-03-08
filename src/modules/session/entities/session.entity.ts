import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { User } from "../../user/entities/user.entity";

@Entity("sessions")
export class Session extends BaseEntity {
  @Column()
  title: string;

  @Column({ default: "open" })
  status: string;

  @Column({ type: "uuid" })
  createdById: string;

  /** Discord channel where this session runs (nullable if created via API only) */
  @Column({ type: "varchar", nullable: true })
  discordChannelId: string | null;

  /** Discord guild (server) id for this session */
  @Column({ type: "varchar", nullable: true })
  discordGuildId: string | null;

  /** Voting scale: points (1-5), fibonacci, etc. Default points. */
  @Column({ type: "varchar", default: "points" })
  voteScale: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "createdById" })
  createdBy: User;
}
