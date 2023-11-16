import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { TranslatorService } from './translator.service';
import { LexicalInfoService } from './lexical-info.service';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { Card } from './entities/card.entity';
import { CardSchema } from './card.schema';
import { DeckModule } from 'src/deck/deck.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Card.name, schema: CardSchema }]),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5
    }),
    DeckModule
  ],
  controllers: [CardController],
  providers: [CardService, TranslatorService, LexicalInfoService],
})
export class CardModule {}
