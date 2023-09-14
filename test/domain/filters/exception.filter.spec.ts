import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';

import { BusinessException } from '@domain/exceptions/business.exception';
import {
  ApiError,
  CustomExceptionFilter,
} from '@domain/filters/exception.filter';

describe('CustomExceptionFilter', () => {
  let customExceptionFilter: CustomExceptionFilter;
  let mockResponse: Response;
  let mockRequest: Request;
  let mockHost: ArgumentsHost;
  const statusResponseMock = {
    json: jest.fn((x) => x),
  };

  beforeEach(() => {
    customExceptionFilter = new CustomExceptionFilter();
    mockResponse = {
      status: jest.fn(() => statusResponseMock),
      json: jest.fn(),
    } as unknown as Response;
    mockRequest = {} as unknown as Request;
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;
  });

  it('should handle BusinessException and return the expected API error response', () => {
    const exception = new BusinessException(
      'generic',
      ['Error 1', 'Error 2'],
      HttpStatus.BAD_REQUEST,
    );

    customExceptionFilter.catch(exception, mockHost);

    const expectedBody: ApiError = {
      id: expect.any(String),
      errors: ['Error 1', 'Error 2'],
      module: 'generic',
      timestamp: expect.any(Date),
      statusCode: HttpStatus.BAD_REQUEST,
    };

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(
      mockResponse.status(HttpStatus.BAD_REQUEST).json,
    ).toHaveBeenCalledWith(expectedBody);
  });

  it('should handle HttpException and return the expected API error response', () => {
    const exception = new HttpException(
      ['Http Error 1', 'Http Error 2'],
      HttpStatus.NOT_FOUND,
    );

    const businessException = new BusinessException(
      'generic',
      ['Http Error 1', 'Http Error 2'],
      exception.getStatus(),
    );

    customExceptionFilter.catch(businessException, mockHost);

    const expectedBody: ApiError = {
      id: expect.any(String),
      errors: ['Http Error 1', 'Http Error 2'],
      module: 'generic',
      timestamp: expect.any(Date),
      statusCode: HttpStatus.NOT_FOUND,
    };

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.status(HttpStatus.NOT_FOUND).json).toHaveBeenCalledWith(
      expectedBody,
    );
  });

  it('should handle other exceptions and return a 500 status code', () => {
    const businessException = new BusinessException(
      'generic',
      ['Unexpected Error'],
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    customExceptionFilter.catch(businessException, mockHost);

    const expectedBody: ApiError = {
      id: expect.any(String),
      errors: ['Unexpected Error'],
      module: 'generic',
      timestamp: expect.any(Date),
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    };

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(
      mockResponse.status(HttpStatus.INTERNAL_SERVER_ERROR).json,
    ).toHaveBeenCalledWith(expectedBody);
  });
});
