import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ValidateUserMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // const { authorization } = req.headers;
    // if (!authorization) {
    //   res
    //     .status(HttpStatus.UNAUTHORIZED)
    //     .send({ error: 'No authorization token provided!' });
    // }
    next();
  }
}
