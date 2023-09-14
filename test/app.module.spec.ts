import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';

import { AppModule } from '@src/app.module';
import { ApplicationModule } from '@application/application.module';

describe('AppModule', () => {
  let appModule: TestingModule;

  beforeAll(async () => {
    appModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: JwtModule,
          useValue: {
            register: jest.fn(),
          },
        },
      ],
    }).compile();
  });

  it('should be defined', () => {
    expect(appModule).toBeDefined();
  });

  it('should import ApplicationModule', () => {
    const imports = Reflect.getMetadata('imports', AppModule);
    expect(imports).toContain(ApplicationModule);
  });
});
