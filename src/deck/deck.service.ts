import { ConflictException, Injectable } from '@nestjs/common';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Deck, DeckDocument } from './deck.schema';
import { Model } from 'mongoose';

@Injectable()
export class DeckService {
  constructor(@InjectModel(Deck.name) private readonly deckModel: Model<DeckDocument>) {}

  async create(createDeckDto: CreateDeckDto, creatorId: string) {
    // Check if Deck already exists for User
    const duplicate = await this.deckModel.findOne({ 
      name: createDeckDto.name,
      creator: creatorId
    })
    if (duplicate) {
      throw new ConflictException(`The Deck ${ createDeckDto.name } already exists`);
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
    return await this.deckModel.find({ creator: userId }).sort({ 'createdAt': 'asc' });
  }

  async findOne(id: string) {
    return await this.deckModel.findById(id);
  }

  async update(id: string, updateDeckDto: UpdateDeckDto, creatorId: string) {
    const duplicate = await this.deckModel.findOne({ 
      name: updateDeckDto.name,
      creator: creatorId
    })
    if (duplicate) {
      throw new ConflictException(`The Deck ${ updateDeckDto.name } already exists`);
    }

    return await this.deckModel.findByIdAndUpdate(
      id,
      { $set: updateDeckDto },
      { new: true }
    )
  }

  async remove(id: string) {
    return await this.deckModel.deleteOne({ _id: id });
  }
}
