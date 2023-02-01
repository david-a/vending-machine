import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { MongoServerError } from 'mongodb';

@Catch(MongoServerError)
export class MongoExceptionFilter implements ExceptionFilter {
  catch(exception: MongoServerError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'Internal server error';
    switch (exception.code) {
      case 11000: // duplicate exception
        error = 'username or email already exists';
    }
    (response as any).status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      error,
    });
  }
}
