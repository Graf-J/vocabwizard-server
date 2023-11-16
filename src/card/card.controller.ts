import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { TranslatorService } from './translator.service';
import { Language } from 'src/deck/languages.enum';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { LexicalInfoService } from './lexical-info.service';

@UseGuards(AuthGuard)
@Controller('deck/:deckId/card')
export class CardController {
  constructor(
    private readonly cardService: CardService,
    private readonly translatorService: TranslatorService,
    private readonly lexicalInfoService: LexicalInfoService
  ) {}

  @Post()
  create(@Body() createCardDto: CreateCardDto) {
    return this.cardService.create(createCardDto);
  }

  @Get()
  async findAll() {
    const WORD = ''

    const translatorResult = await this.translatorService.translate(WORD, Language.en, Language.de);
    const lexicalInfoResult = await this.lexicalInfoService.getInfo(WORD);

    console.log(translatorResult.data);
    return lexicalInfoResult.error;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cardService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCardDto: UpdateCardDto) {
    return this.cardService.update(+id, updateCardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cardService.remove(+id);
  }
}
