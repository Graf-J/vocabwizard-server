import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Deck } from 'src/deck/deck.schema';

export type CardDocument = HydratedDocument<Card>;

@Schema()
export class Card {
    @Prop({ required: true, unique: true })
    word: string;

    @Prop({ required: true })
    translation: string;

    @Prop()
    phonetic: string;

    @Prop()
    audioLink: string

    @Prop()
    definitions: string[]

    @Prop()
    examples: string[]

    @Prop()
    synonyms: string[]

    @Prop()
    antonyms: string[]

    @Prop({ required: true, default: 1 })
    stage: number

    @Prop({ required: true })
    expires: Date;

    @Prop({ 
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Deck'
    })
    deck: Deck;
    
    @Prop({ required: true })
    createdAt: Date;
}

export const CardSchema = SchemaFactory.createForClass(Card);
