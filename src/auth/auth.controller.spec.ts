import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
    })
      .useMocker((token) => {
        // if (token === AuthService) {
        //   return { /* mock AuthService methods as needed */ };
        // }
        // if (token === UserService) {
        //   return { /* mock UserService methods as needed */ };
        // }
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(
            token,
          ) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    controller = moduleRef.get(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
