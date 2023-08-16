import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Permission } from './Permission';
import { User } from './User';

@Entity()
export class Role {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  id: string;

  @Column({
    nullable: false,
    default: '',
  })
  name: string;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  @ManyToMany(() => Permission, (permission) => permission.roles)
  permissions: Permission[];
}
