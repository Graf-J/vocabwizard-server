import { Controller, Get, Post, Body, Param, Delete, UseGuards, BadRequestException, NotFoundException, ForbiddenException, Req, Patch, ConflictException } from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { DeckService } from 'src/deck/deck.service';
import { Role } from 'src/user/roles.enum';
import { UpdateConfidenceDto } from './dto/update-confidence.dto';
import { Confidence } from './confidence.enum';
import { CardDto } from './dto/card.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ObjectIdValidationPipe } from 'src/util/pipe/objectid-validation.pipe';
import { OwnDeckOrAdminGuard } from 'src/auth/guard/owdDeckOrAdmin.guard';

@ApiTags('Card')
@ApiBearerAuth()
@UseGuards(OwnDeckOrAdminGuard)
@UseGuards(AuthGuard)
@Controller('deck/:deckId/card')
export class CardController {
  constructor(
    private readonly cardService: CardService,
    private readonly deckService: DeckService,
  ) {}

  @Post()
  async create(@Req() request, @Param('deckId', ObjectIdValidationPipe) deckId: string, @Body() createCardDto: CreateCardDto) {
    const card =  await this.cardService.create(createCardDto, request.deck);
    return { 'id': card.id };
  }

  @Get()
  async findAll(@Req() request, @Param('deckId', ObjectIdValidationPipe) deckId: string) {
    const cards = await this.cardService.findAll(deckId);
    return cards.map(card => new CardDto(card));
  }

  @Get('learn')
  async findCardsToLearn(@Req() request, @Param('deckId', ObjectIdValidationPipe) deckId: string) {
    const cards = await this.cardService.findCardsToLearn(request.deck.id, request.deck.learningRate);
    return cards.map(card => new CardDto(card));
  }

  @Delete(':cardId')
  async remove(@Req() request, @Param('cardId', ObjectIdValidationPipe) cardId: string) {
    const card = await this.cardService.findOne(cardId);
    if (card.deck.toString() !== request.deck.id) {
      throw new ConflictException('Card does not belong to Deck');
    }

    await this.cardService.remove(cardId);
  }

  @Patch(':cardId/confidence')
  async updateConfidence(@Req() request, @Param('deckId', ObjectIdValidationPipe) deckId: string, @Param('cardId', ObjectIdValidationPipe) cardId: string, @Body() updateConfidenceDto: UpdateConfidenceDto) {
    const card = await this.cardService.findOne(cardId);
    if (card.deck.toString() !== request.deck.id) {
      throw new ConflictException('Card does not belong to Deck');
    }

    switch(updateConfidenceDto.confidence) {
      case Confidence.repeat:
        await this.cardService.updateCardRepeat(card);
        break;
      case Confidence.hard:
        await this.cardService.updateCardHard(card);
        break;
      case Confidence.good:
        await this.cardService.updateCardGood(card);
        break;
      case Confidence.easy:
        await this.cardService.updateCardEasy(card);
        break;
    }
  }
}
