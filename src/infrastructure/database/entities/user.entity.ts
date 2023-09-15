import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Role } from './role.entity';
import { Base } from './base.entity';

@Entity()
export class User extends Base {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  id: string;

  @Column({
    nullable: false,
    default: '',
  })
  userName: string;

  @Column({
    nullable: false,
    default: '',
    unique: true,
  })
  email: string;

  @Column({
    nullable: false,
    default: '',
  })
  password: string;

  @Column({
    nullable: false,
    default: true,
  })
  isActive: boolean;

  @Column({
    nullable: true,
    default: '',
  })
  resetToken: string;

  @Column({
    nullable: true,
    default: new Date(),
  })
  resetTokenExpires: Date;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'roleId',
      referencedColumnName: 'id',
    },
  })
  roles: Role[];
}
