import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { TranslatorService } from './translator.service';
import { LexicalInfoService } from './lexical-info.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5
    }),
  ],
  controllers: [CardController],
  providers: [CardService, TranslatorService, LexicalInfoService],
})
export class CardModule {}
