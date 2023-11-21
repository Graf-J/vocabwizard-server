import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req, Put } from '@nestjs/common';
import { DeckService } from './deck.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { DeckDto } from './dto/deck.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ObjectIdValidationPipe } from 'src/util/pipe/objectid-validation.pipe';
import { OwnDeckOrAdminGuard } from 'src/auth/guard/owdDeckOrAdmin.guard';

@ApiTags('Deck')
@ApiBearerAuth()
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

  @UseGuards(OwnDeckOrAdminGuard)
  @Get(':deckId')
  async findOne(@Req() request, @Param('deckId', ObjectIdValidationPipe) deckId: string) {
    return new DeckDto(request.deck);
  }

  @UseGuards(OwnDeckOrAdminGuard)
  @Put(':deckId')
  async update(@Req() request, @Param('deckId', ObjectIdValidationPipe) deckId: string, @Body() updateDeckDto: UpdateDeckDto) {
    const updatedDeck =  await this.deckService.update(deckId, updateDeckDto, request.deck.creator.toString());
    return new DeckDto(updatedDeck);
  }

  @UseGuards(OwnDeckOrAdminGuard)
  @Delete(':deckId')
  async remove(@Param('deckId', ObjectIdValidationPipe) deckId: string) {
    await this.deckService.remove(deckId);
  }
}
