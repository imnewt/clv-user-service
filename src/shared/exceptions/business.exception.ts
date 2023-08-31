import { HttpStatus } from '@nestjs/common';

export type ErrorModule =
  | 'auth'
  | 'users'
  | 'roles'
  | 'permissions'
  | 'generic';

export class BusinessException extends Error {
  public readonly id: string;
  public readonly timestamp: Date;

  constructor(
    public readonly module: ErrorModule,
    public readonly errors: string[],
    public readonly statusCode: HttpStatus,
  ) {
    super();
    this.id = BusinessException.genId();
    this.timestamp = new Date();
  }

  private static genId(length = 16): string {
    const p = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return [...Array(length)].reduce(
      (a) => a + p[~~(Math.random() * p.length)],
      '',
    );
  }
}
