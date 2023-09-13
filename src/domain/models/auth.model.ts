export class AuthResponse {
  constructor(
    public accessToken: string,
    public refreshToken: string,
    public userId: string,
  ) {}
}

export class AuthPayload {
  constructor(
    public userId: string,
    public userName: string,
  ) {}
}
