import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req, ForbiddenException, Put } from '@nestjs/common';
import { DeckService } from './deck.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Role } from 'src/user/roles.enum';

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
    return decks.map(deck => ({
      id: deck.id,
      name: deck.name,
      learningRate: deck.learningRate,
      fromLang: deck.fromLang,
      toLang: deck.toLang
    }))
  }

  @Get(':id')
  async findOne(@Req() request, @Param('id') id: string) {
    const deck = await this.deckService.findOne(id);

    if (!(deck.creator.toString() === request.user.id || request.user.role === Role.administrator)) {
      throw new ForbiddenException("You are only allowed to view your own decks");
    }

    return {
      id: deck.id,
      name: deck.name,
      learningRate: deck.learningRate,
      fromLang: deck.fromLang,
      toLang: deck.toLang
    }
  }

  @Put(':id')
  async update(@Req() request, @Param('id') id: string, @Body() updateDeckDto: UpdateDeckDto) {
    const deck = await this.deckService.findOne(id);

    if (!(deck.creator.toString() === request.user.id || request.user.role === Role.administrator)) {
      throw new ForbiddenException("You are only allowed to update your own decks");
    }

    return await this.deckService.update(id, updateDeckDto);
  }

  @Delete(':id')
  async remove(@Req() request, @Param('id') id: string) {
    const deck = await this.deckService.findOne(id);

    if (!(deck.creator.toString() === request.user.id || request.user.role === Role.administrator)) {
      throw new ForbiddenException("You are only allowed to delete your own decks");
    }

    await this.deckService.remove(id);
  }
}
