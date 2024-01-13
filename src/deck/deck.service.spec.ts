import { Test, TestingModule } from '@nestjs/testing';
import { DeckService } from './deck.service';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { getModelToken } from '@nestjs/mongoose';
import { Deck } from './deck.schema';

const moduleMocker = new ModuleMocker(global);

describe('DeckService', () => {
  let service: DeckService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeckService,
        {
          provide: getModelToken(Deck.name),
          useValue: Deck, // https://stackoverflow.com/questions/55143467/testing-mongoose-models-with-nestjs
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

    service = module.get<DeckService>(DeckService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
