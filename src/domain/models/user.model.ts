import { Role } from './role.model';

export class User {
  constructor(
    public id: string,
    public userName: string,
    public email: string,
    public password: string,
    public isActive: boolean,
    public resetToken: string,
    public resetTokenExpires: Date,
    public roles: Role[],
  ) {}
}
