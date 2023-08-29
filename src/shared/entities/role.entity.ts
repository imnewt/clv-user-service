import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Permission } from './permission.entity';
import { User } from './user.entity';
import { Base } from './base.entity';

@Entity()
export class Role extends Base {
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
