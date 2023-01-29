import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ApplicationModule } from 'src/bootstrap/application.module';
import { v4 as uuid } from 'uuid';

describe('ConfigurationController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApplicationModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    // Given
    const configurationId = uuid();
    return request(app.getHttpServer()).get(`/${configurationId}`).expect(404);
  });
});
