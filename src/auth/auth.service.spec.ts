import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { createMock } from '@golevelup/ts-jest';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    })
      .useMocker(createMock)
      .compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validatePassword', () => {
    it('should throw exception if bcrypt decides passwords do not match', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const responsePromise = service.validatePassword(
        'invalidPassword',
        'passwordHash',
      );

      await expect(responsePromise).rejects.toThrow(UnauthorizedException);
      await expect(responsePromise).rejects.toThrow(
        'Username or Password is not valid',
      );
    });

    it('should throw no exception if bcrypt decides passwords do match', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const responsePromise = service.validatePassword(
        'validPassword',
        'passwordHash',
      );

      await expect(responsePromise).resolves.not.toThrow();
    });
  });
});
