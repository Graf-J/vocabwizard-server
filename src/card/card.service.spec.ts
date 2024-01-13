import { Test, TestingModule } from '@nestjs/testing';
import { CardService } from './card.service';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { Card } from './card.schema';
import { getModelToken } from '@nestjs/mongoose';

const moduleMocker = new ModuleMocker(global);

describe('CardService', () => {
  let service: CardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardService,
        {
          provide: getModelToken(Card.name),
          useValue: Card, // https://stackoverflow.com/questions/55143467/testing-mongoose-models-with-nestjs
        },
      ],
    })
      .useMocker((token) => {
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(
            token,
          ) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    service = module.get<CardService>(CardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
