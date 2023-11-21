import { Controller, Get, Post, Body, Param, Delete, UseGuards, BadRequestException, NotFoundException, ForbiddenException, Req, Patch, ConflictException } from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { isValidObjectId } from 'mongoose';
import { DeckService } from 'src/deck/deck.service';
import { Role } from 'src/user/roles.enum';
import { UpdateConfidenceDto } from './dto/update-confidence.dto';
import { Confidence } from './confidence.enum';
import { CardDto } from './dto/card.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Card')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('deck/:deckId/card')
export class CardController {
  constructor(
    private readonly cardService: CardService,
    private readonly deckService: DeckService,
  ) {}

  @Post()
  async create(@Req() request, @Param('deckId') deckId: string, @Body() createCardDto: CreateCardDto) {
    // Check if Deck-Id is valid
    if (!isValidObjectId(deckId)) {
      throw new BadRequestException(`Id '${ deckId }' is not valid`);
    }

    // Check if Deck exists
    const deck = await this.deckService.findOne(deckId);
    if (!deck) {
      throw new NotFoundException(`Deck with Id '${ deckId }' not found`);
    }

    // Check if User is allowed to view Cards of Deck
    if (!(deck.creator.toString() === request.user.id || request.user.role === Role.administrator)) {
      throw new ForbiddenException("You are only allowed to create a card in your own deck");
    }
    
    const card =  await this.cardService.create(createCardDto, deck);
    return { 'id': card.id };
  }

  @Get()
  async findAll(@Req() request, @Param('deckId') deckId: string) {
    // Check if Deck-Id is valid
    if (!isValidObjectId(deckId)) {
      throw new BadRequestException(`Id '${ deckId }' is not valid`);
    }
    // Check if Deck exists
    const deck = await this.deckService.findOne(deckId);
    if (!deck) {
      throw new NotFoundException(`Deck with Id '${ deckId }' not found`);
    }

    // Check if User is allowed to view Cards of Deck
    if (!(deck.creator.toString() === request.user.id || request.user.role === Role.administrator)) {
      throw new ForbiddenException("You are only allowed to view cards of you own deck");
    }

    const cards = await this.cardService.findAll(deckId);
    return cards.map(card => new CardDto(card));
  }

  @Get('learn')
  async findCardsToLearn(@Req() request, @Param('deckId') deckId: string) {
    // Check if IDs are valid
    if (!isValidObjectId(deckId)) {
      throw new BadRequestException(`Id '${ deckId }' is not valid`);
    }
    // Check if Deck exists
    const deck = await this.deckService.findOne(deckId);
    if (!deck) {
      throw new NotFoundException(`Deck with Id '${ deckId }' not found`);
    }
    // Check if User is allowed to view Cards of Deck
    if (!(deck.creator.toString() === request.user.id || request.user.role === Role.administrator)) {
      throw new ForbiddenException("You are only allowed to delete a card of you own deck");
    }

    const cards = await this.cardService.findCardsToLearn(deck.id, deck.learningRate);
    return cards.map(card => new CardDto(card));
  }

  @Delete(':cardId')
  async remove(@Req() request, @Param('deckId') deckId: string, @Param('cardId') cardId: string) {
    // Check if IDs are valid
    if (!isValidObjectId(deckId)) {
      throw new BadRequestException(`Id '${ deckId }' is not valid`);
    }
    if (!isValidObjectId(cardId)) {
      throw new BadRequestException(`Id '${ cardId }' is not valid`);
    }
    // Check if Deck exists
    const deck = await this.deckService.findOne(deckId);
    if (!deck) {
      throw new NotFoundException(`Deck with Id '${ deckId }' not found`);
    }
    // TODO: Get Card and check if it belongs to deck like below

    // Check if User is allowed to view Cards of Deck
    if (!(deck.creator.toString() === request.user.id || request.user.role === Role.administrator)) {
      throw new ForbiddenException("You are only allowed to delete a card of you own deck");
    }

    await this.cardService.remove(cardId);
  }

  @Patch(':cardId/confidence')
  async updateConfidence(@Req() request, @Param('deckId') deckId: string, @Param('cardId') cardId: string, @Body() updateConfidenceDto: UpdateConfidenceDto) {
    // Check if IDs are valid
    // TODO: Create custom Pipe for ObjectID Validation
    if (!isValidObjectId(deckId)) {
      throw new BadRequestException(`Id '${ deckId }' is not valid`);
    }
    if (!isValidObjectId(cardId)) {
      throw new BadRequestException(`Id '${ cardId }' is not valid`);
    }
    // Check if Deck and Card exists
    const [deck, card] = await Promise.all([
      this.deckService.findOne(deckId),
      this.cardService.findOne(cardId)
    ]);
    // TODO: Throw the Exceptions in the methods of the controller
    if (!deck) {
      throw new NotFoundException(`Deck with Id '${ deckId }' not found`);
    }
    if (!card) {
      throw new NotFoundException(`Card with Id '${ cardId }' not found`);
    }
    if (card.deck.toString() !== deck.id) {
      throw new ConflictException('Card does not belong to Deck');
    }

    // TODO: Extract this Validation to an async Guard
    // Check if User is allowed to view Cards of Deck
    if (!(deck.creator.toString() === request.user.id || request.user.role === Role.administrator)) {
      throw new ForbiddenException("You are only allowed to update a card of you own deck");
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
