import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { AuthMethod } from 'src/users/dtos/create-user.dto';

@Entity()
export class User {
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
  })
  authMethod: AuthMethod;
}
