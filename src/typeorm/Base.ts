import { Column, Entity } from 'typeorm';

@Entity()
export class Base {
  @Column({
    nullable: false,
    default: new Date(),
  })
  createdAt: Date;

  @Column({
    nullable: false,
    default: new Date(),
  })
  updatedAt: Date;
}
