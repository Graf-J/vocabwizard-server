import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsString, Min, MinLength } from "class-validator";
import { Language } from "../languages.enum";

export class CreateDeckDto {
    @IsString()
    @MinLength(4)
    @IsNotEmpty()
    name: string;

    @IsInt()
    @Min(1)
    @IsNotEmpty()
    learningRate: number;

    @IsEnum(Language)
    @IsNotEmpty()
    fromLang: Language;
    
    @IsEnum(Language)
    @IsNotEmpty()
    toLang: Language;
}
