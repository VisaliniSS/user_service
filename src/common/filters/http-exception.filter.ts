import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    console.log(`\n🚨 Exception caught:`, exception);

    // Handle HTTP Exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;

      message = exceptionResponse.message || exception.message;
      error = exceptionResponse.error || 'Bad Request';

      console.log(`📍 HTTP Exception - Status: ${status}, Message: ${message}`);
    }
    // Handle Database Unique Constraint Errors
    else if (exception instanceof Error) {
      const errorMessage = exception.message;

      if (errorMessage.includes('duplicate key') || errorMessage.includes('unique constraint')) {
        status = HttpStatus.CONFLICT;
        error = 'Conflict';

        // Extract which field caused the duplicate constraint
        if (errorMessage.includes('email')) {
          message = 'Email is already registered';
        } else if (errorMessage.includes('mobileNumber')) {
          message = 'Mobile number is already registered';
        } else {
          message = 'This value is already registered in the system';
        }

        console.log(`📍 Database Unique Constraint Error - ${message}`);
      } else if (errorMessage.includes('TypeError')) {
        status = HttpStatus.BAD_REQUEST;
        message = 'Invalid request data';
        error = 'Bad Request';
        console.log(`📍 Type Error - ${message}`);
      } else {
        message = exception.message || 'An unexpected error occurred';
        console.log(`📍 Generic Error - ${message}`);
      }

      this.logger.error(`Error: ${exception.message}`, exception.stack);
    }

    // Build response
    const responsePayload = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error,
      message,
    };

    console.log(`\n📤 Error Response:`, responsePayload, '\n');

    response.status(status).json(responsePayload);
  }
}
