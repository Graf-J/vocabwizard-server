import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req, ForbiddenException, Put, BadRequestException, NotFoundException } from '@nestjs/common';
import { DeckService } from './deck.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Role } from 'src/user/roles.enum';
import { isValidObjectId } from 'mongoose';
import { DeckDto } from './dto/deck.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Deck')
@UseGuards(AuthGuard)
@Controller('deck')
export class DeckController {
  constructor(private readonly deckService: DeckService) {}

  @Post()
  async create(@Req() request, @Body() createDeckDto: CreateDeckDto) {
    const deck = await this.deckService.create(createDeckDto, request.user.id);
    return { 'id': deck.id };
  }

  @Get()
  async findAll(@Req() request) {
    const decks = await this.deckService.findAll(request.user.id);
    return decks.map(deck => new DeckDto(deck));
  }

  @Get(':id')
  async findOne(@Req() request, @Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`Id '${ id }' is not valid`);
    }

    const deck = await this.deckService.findOne(id);
    if (!deck) {
      throw new NotFoundException(`Deck with Id '${ id }' not found`);
    }

    if (!(deck.creator.toString() === request.user.id || request.user.role === Role.administrator)) {
      throw new ForbiddenException("You are only allowed to view your own decks");
    }

    return new DeckDto(deck);
  }

  @Put(':id')
  async update(@Req() request, @Param('id') id: string, @Body() updateDeckDto: UpdateDeckDto) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`Id '${ id }' is not valid`);
    }

    const deck = await this.deckService.findOne(id);
    if (!deck) {
      throw new NotFoundException(`Deck with Id '${ id }' not found`);
    }

    if (!(deck.creator.toString() === request.user.id || request.user.role === Role.administrator)) {
      throw new ForbiddenException("You are only allowed to update your own decks");
    }

    const updatedDeck =  await this.deckService.update(id, updateDeckDto, deck.creator.toString());
    return new DeckDto(updatedDeck);
  }

  @Delete(':id')
  async remove(@Req() request, @Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`Id '${ id }' is not valid`);
    }

    const deck = await this.deckService.findOne(id);
    if (!deck) {
      throw new NotFoundException(`Deck with Id '${ id }' not found`);
    }

    if (!(deck.creator.toString() === request.user.id || request.user.role === Role.administrator)) {
      throw new ForbiddenException("You are only allowed to delete your own decks");
    }

    await this.deckService.remove(id);
  }
}
