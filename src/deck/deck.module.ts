import { Module, forwardRef } from '@nestjs/common';
import { DeckService } from './deck.service';
import { DeckController } from './deck.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Deck, DeckSchema } from './deck.schema';
import { CardModule } from 'src/card/card.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Deck.name, schema: DeckSchema }]),
    forwardRef(() => CardModule),
  ],
  controllers: [DeckController],
  providers: [DeckService],
  exports: [DeckService]
})
export class DeckModule {}
