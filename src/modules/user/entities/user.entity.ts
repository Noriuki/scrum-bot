import { Column, Entity } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";

@Entity("users")
export class User extends BaseEntity {
  @Column({ unique: true })
  discordId: string;

  @Column({ type: "varchar", nullable: true })
  name: string | null;
}
