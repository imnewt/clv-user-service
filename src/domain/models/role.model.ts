import { User } from './user.model';
import { Permission } from './permission.model';

export class Role {
  constructor(
    public id: string,
    public name: string,
    public users: User[],
    public permissions: Permission[],
  ) {}
}
