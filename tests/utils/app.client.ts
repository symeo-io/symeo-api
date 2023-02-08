import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import User from 'src/domain/model/user.model';
import { ApplicationModule } from 'src/bootstrap/application.module';
import supertest from 'supertest';
import { SymeoExceptionHttpFilter } from 'src/application/exception/symeo.exception.http.filter';
import { AuthGuard } from '@nestjs/passport';

let loggedInUser: User | undefined;

class AuthGuardMock implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    request.user = loggedInUser;

    return !!loggedInUser;
  }
}

export class AppClient {
  public app: INestApplication;
  public module: TestingModule;

  public async init() {
    this.module = await Test.createTestingModule({
      imports: [ApplicationModule],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useClass(AuthGuardMock)
      .compile();

    this.app = this.module.createNestApplication();
    this.app.useGlobalFilters(new SymeoExceptionHttpFilter());
    this.app.useGlobalPipes(new ValidationPipe());

    await this.app.init();
  }

  public async close() {
    await this.app.close();
  }

  public request(currentUser?: User): supertest.SuperTest<supertest.Test> {
    loggedInUser = currentUser;

    return request(this.app.getHttpServer());
  }
}
