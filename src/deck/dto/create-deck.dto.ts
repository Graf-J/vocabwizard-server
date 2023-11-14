import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsString, Min, MinLength, Validate } from "class-validator";
import { Language } from "../languages.enum";
import { NotMatchConstraint } from "../validator/not-match-constraint.validator";
import { LangIsEnConstraint } from "../validator/lang-is-en-constraint.validator";

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
    @Validate(NotMatchConstraint, ['fromLang'])
    @Validate(LangIsEnConstraint, ['fromLang'])
    toLang: Language;
}
