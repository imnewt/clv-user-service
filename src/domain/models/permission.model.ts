import { Role } from './role.model';

export class Permission {
  constructor(
    public id: string,
    public name: string,
    public roles: Role[],
  ) {}
}
