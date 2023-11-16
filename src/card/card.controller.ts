import { Controller, Get, Post, Body, Param, Delete, UseGuards, BadRequestException, NotFoundException, ForbiddenException, Req } from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { isValidObjectId } from 'mongoose';
import { DeckService } from 'src/deck/deck.service';
import { Role } from 'src/user/roles.enum';

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
    return cards.map(card => ({
      id: card.id,
      word: card.word,
      translation: card.translation,
      phonetic: card.phonetic,
      audioLink: card.audioLink,
      definitions: card.definitions,
      examples: card.examples,
      synonyms: card.synonyms,
      antonyms: card.antonyms,
      stage: card.stage,
      expires: card.expires,
      createdAt: card.createdAt
    }))
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

    // Check if User is allowed to view Cards of Deck
    if (!(deck.creator.toString() === request.user.id || request.user.role === Role.administrator)) {
      throw new ForbiddenException("You are only allowed to delete a card of you own deck");
    }

    await this.cardService.remove(cardId);
  }
}
