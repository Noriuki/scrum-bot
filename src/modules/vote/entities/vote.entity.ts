import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { Story } from "../../story/entities/story.entity";
import { User } from "../../user/entities/user.entity";

@Entity("votes")
export class Vote extends BaseEntity {
  @Column({ type: "uuid" })
  storyId: string;

  @Column({ type: "uuid" })
  userId: string;

  @Column({ type: "int" })
  value: number;

  @Column({ default: false })
  revealed: boolean;

  @ManyToOne(() => Story, { onDelete: "CASCADE" })
  @JoinColumn({ name: "storyId" })
  story: Story;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;
}
