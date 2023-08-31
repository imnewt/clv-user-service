import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { get, isEmpty } from 'lodash';

import {
  BusinessException,
  ErrorModule,
} from '../exceptions/business.exception';

export interface ApiError {
  id: string;
  module: ErrorModule;
  errors: string[];
  timestamp: Date;
  statusCode: HttpStatus;
}

@Catch(Error)
export class CustomExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(CustomExceptionFilter.name);

  catch(exception: Error, host: ArgumentsHost) {
    let body: ApiError;
    const classValidatorErrors: string[] =
      get(exception, 'response.message') || [];
    const exceptionErrors: string[] = get(exception, 'errors') || [];
    const errors = isEmpty(classValidatorErrors)
      ? exceptionErrors
      : classValidatorErrors;

    if (exception instanceof BusinessException) {
      // Straightforward handling of our own exceptions
      body = {
        id: exception.id,
        errors,
        module: exception.module,
        timestamp: exception.timestamp,
        statusCode: exception.statusCode,
      };
    } else if (exception instanceof HttpException) {
      body = new BusinessException('generic', errors, exception.getStatus());
    } else {
      // For all other exceptions simply return 500 error
      body = new BusinessException(
        'generic',
        errors,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    this.logger.error(
      `Got an exception: ${JSON.stringify({
        path: request.url,
        ...body,
      })}`,
    );

    response.status(body.statusCode).json(body);
  }
}
