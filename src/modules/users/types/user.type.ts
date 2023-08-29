import { Exclude } from 'class-transformer';

export class User {
  id: string;
  userName: string;
  email: string;
  password: string;
}

export class SerializedUser {
  id: string;
  userName: string;
  email: string;

  @Exclude()
  password: string;

  constructor(partial: Partial<SerializedUser>) {
    Object.assign(this, partial);
  }
}
