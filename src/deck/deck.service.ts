import { Injectable } from '@nestjs/common';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Deck, DeckDocument } from './deck.schema';
import { Model } from 'mongoose';

@Injectable()
export class DeckService {
  constructor(@InjectModel(Deck.name) private readonly deckModel: Model<DeckDocument>) {}

  async create({ name, learningRate, fromLang, toLang}: CreateDeckDto, creatorId: string) {
    const deck = new this.deckModel({
      name,
      learningRate,
      fromLang,
      toLang,
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

  async update(id: string, updateDeckDto: UpdateDeckDto) {
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
