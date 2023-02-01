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
import { DomainModule } from '../../src/bootstrap/domain.module';

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
    }).compile();

    this.app = this.module.createNestApplication();
    this.app.useGlobalPipes(new ValidationPipe());
    this.app.useGlobalGuards(new AuthGuardMock());

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
