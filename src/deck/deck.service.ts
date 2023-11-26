import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Deck, DeckDocument } from './deck.schema';
import mongoose, { Model } from 'mongoose';
import { CardService } from 'src/card/card.service';

@Injectable()
export class DeckService {
  constructor(
    @InjectModel(Deck.name) private readonly deckModel: Model<DeckDocument>,
    private readonly cardService: CardService
  ) {}

  async create(createDeckDto: CreateDeckDto, creatorId: string) {
    // Check if Deck already exists for User
    const duplicate = await this.deckModel.findOne({ 
      name: createDeckDto.name,
      creator: creatorId
    })
    if (duplicate) {
      throw new ConflictException(`Deck already exists: ${ createDeckDto.name }`);
    }

    // Insert Deck into Database
    const deck = new this.deckModel({
      ...createDeckDto,
      creator: creatorId,
      createdAt: Date.now(),
    });
    return await deck.save()
  }

  async findAll(userId: string) {
    const currentDate = new Date();
    // Joins New Cards with the Decks (cards where expires = null)
    const lookupNewCards = {
      $lookup: {
        from: 'cards',
        localField: '_id',
        foreignField: 'deck',
        as: 'newCards',
        pipeline: [
          {
            $match: { expires: null }
          }
        ]
      }
    }
    // Joins Old Cards with the Decks (cards where expires < Date.now)
    const lookupOldCards = {
      $lookup: {
        from: 'cards',
        localField: '_id',
        foreignField: 'deck',
        as: 'oldCards',
        pipeline: [
          { $match: { expires: { $lt: currentDate } } }
        ]
      }
    }
    // Aggregates old and new cards into a count variable
    const countCards = { 
      $addFields: {
        newCardCount: { $size: '$newCards' },
        oldCardCount: { $size: '$oldCards' },
      }
    }
    // Excludes newCards and oldCards to save bandwidth
    const projection = {
      $project: {
        newCards: 0,
        oldCards: 0
      }
    }
    // Execute statements and return result
    return await this.deckModel.aggregate([
      { $match: { creator: new mongoose.Types.ObjectId(userId) } },
      lookupNewCards,
      lookupOldCards,
      countCards,
      projection,
      { $sort: { createdAt: 1 } }
    ])
  }

  async findOne(id: string): Promise<DeckDocument> {
    const deck = await this.deckModel.findById(id);

    if (!deck) {
      throw new NotFoundException(`Deck not found`);
    }

    return deck;
  }

  async update(id: string, updateDeckDto: UpdateDeckDto, creatorId: string) {
    const duplicate = await this.deckModel.findOne({ 
      name: updateDeckDto.name,
      creator: creatorId
    })
    if (duplicate && duplicate.id !== id) {
      throw new ConflictException(`Deck already exists: ${ updateDeckDto.name }`);
    }

    return await this.deckModel.findByIdAndUpdate(
      id,
      { $set: updateDeckDto },
      { new: true }
    )
  }

  async remove(id: string) {
    await Promise.all([
      this.cardService.removeCardsFromDecks([id]),
      this.deckModel.deleteOne({ _id: id })
    ]);
  }

  async removeDecksFromUser(creatorId: string) {
    const decks = await this.deckModel.find({ creator: creatorId });
    await Promise.all([
      this.deckModel.deleteMany({ creator: creatorId }),
      this.cardService.removeCardsFromDecks(decks.map(deck => deck._id.toString()))
    ])
  }
}
