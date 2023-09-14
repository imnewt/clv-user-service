import { Test, TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from '@src/app.module';
import { USER_SERVICE_PORT } from '@domain/utilities/constants';

describe('AppModule', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.listen(USER_SERVICE_PORT);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });
});
