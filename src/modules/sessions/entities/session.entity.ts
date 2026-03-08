import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
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

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "createdById" })
  createdBy: User;
}
