import { ConflictException, Injectable } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Deck } from 'src/deck/deck.schema';
import { Language } from 'src/deck/languages.enum';
import { TranslatorService } from './translator.service';
import { LexicalInfoService } from './lexical-info.service';
import ApiResponse from './response/api-response';
import LibreTranslateResponse from './response/libre-translate-response';
import ApiDictionaryResponse, { Definition, Meaning, Phonetic } from './response/api-dictionary-response';
import { InjectModel } from '@nestjs/mongoose';
import { Card, CardDocument } from './card.schema';
import { Model } from 'mongoose';

@Injectable()
export class CardService {
  constructor(
    private readonly translatorService: TranslatorService,
    private readonly lexicalInfoService: LexicalInfoService,
    @InjectModel(Card.name) private readonly cardModel: Model<CardDocument>
  ) {}

  async create(createCardDto: CreateCardDto, deck: Deck) {
    const { libreTranslateResponse, apiDictionaryResponse } = await this.getExternalData(createCardDto.word.toLowerCase(), deck.fromLang, deck.toLang);

    let externalData;
    if (!apiDictionaryResponse.error) {
      externalData = this.extractInformation(apiDictionaryResponse.data[0])
    }

    const card = new this.cardModel({
      word: createCardDto.word,
      translation: libreTranslateResponse.data.translatedText,
      ...externalData,
      expires: Date.now(),
      deck: deck,
      createdAt: Date.now()
    })
    return await card.save();
  }

  private async getExternalData(word: string, fromLang: Language, toLang: Language) {
    let libreTranslateResponse: ApiResponse<LibreTranslateResponse>;
    let apiDictionaryResponse: ApiResponse<ApiDictionaryResponse[]>;
    if (fromLang === Language.en) {
      // Call both APIs at the same time
      [libreTranslateResponse, apiDictionaryResponse] = await Promise.all([
        this.translatorService.translate(word, fromLang, toLang),
        this.lexicalInfoService.getInfo(word)
      ]);
      if (libreTranslateResponse.error) {
        throw new ConflictException(`No Translation found for ${ word }`)
      }
    } else {
      // Call APIs one after another
      libreTranslateResponse = await this.translatorService.translate(word, fromLang, toLang);
      if (libreTranslateResponse.error) {
        throw new ConflictException(`No Translation found for ${ word }`)
      }
      // Since I know the translated word has to be English, I can call this api now
      apiDictionaryResponse = await this.lexicalInfoService.getInfo(libreTranslateResponse.data.translatedText);
    }

    return { libreTranslateResponse, apiDictionaryResponse };
  }

  private extractInformation(apiDictionaryResponse: ApiDictionaryResponse) {
    const phonetic = this.extractPhonetic(apiDictionaryResponse);
    const meanings = this.extractMeaning(apiDictionaryResponse.meanings);

    return {
      ...phonetic,
      ...meanings
    }
  }

  private extractPhonetic(apiDictionaryResponse: ApiDictionaryResponse) {
    let phonetic;
    let audioLink;
    const audioPhonetic = apiDictionaryResponse.phonetics.find((p: Phonetic) => p.audio)
    if (audioPhonetic) {
      phonetic = audioPhonetic.text;
      audioLink = audioPhonetic.audio;
    } else {
      phonetic = apiDictionaryResponse.phonetic;
    }

    return {
      phonetic,
      audioLink
    };
  }

  private extractMeaning(meanings: Meaning[]) {
    let synonyms: string[] = [];
    let antonyms: string[] = [];
    let definitions: string[] = [];
    let examples: string[] = [];
    meanings.forEach((meaning: Meaning) => {
      synonyms = synonyms.concat(meaning.synonyms);
      antonyms = antonyms.concat(meaning.antonyms);

      meaning.definitions.forEach((definition: Definition) => {
        definitions.push(definition.definition);
        if (definition.example){
          examples.push(definition.example)
        }
      });
    });

    return {
      synonyms,
      antonyms,
      definitions,
      examples
    };
  }

  async findAll(deckId: string) {
    return await this.cardModel.find({ deck: deckId });
  }

  findOne(id: number) {
    return `This action returns a #${id} card`;
  }

  update(id: number, updateCardDto: UpdateCardDto) {
    return `This action updates a #${id} card`;
  }

  remove(id: number) {
    return `This action removes a #${id} card`;
  }
}
