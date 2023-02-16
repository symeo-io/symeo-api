import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  LoggerService,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class Interceptor implements NestInterceptor {
  constructor(@Inject(Logger) private readonly logger: LoggerService) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const now = Date.now();
    const methodCalled = context.getHandler().name;
    return next
      .handle()
      .pipe(
        tap(() =>
          this.logger.log(
            'info',
            `Method ${methodCalled}() executed in ${
              (Date.now() - now) / 1000
            } s.`,
          ),
        ),
      );
  }
}
