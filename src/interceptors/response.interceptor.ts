import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, catchError, map } from 'rxjs';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => ({
        statusCode: HttpStatus.OK,
        message: 'Request successful',
        data,
      })),
      catchError((error) => {
        if (error instanceof HttpException) {
          const status = error.getStatus();
          const response = error.getResponse();
          return new Observable((observer) => {
            observer.next({
              statusCode: status,
              message: response['message'] || error.message,
              error: response['error'] || error.name,
            });
            observer.complete();
          });
        }
        return new Observable((observer) => {
          observer.next({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: error.message || 'An unexpected error occurred',
            error: error.name || 'UnknownError',
          });
          observer.complete();
        });
      }),
    );
  }
}
