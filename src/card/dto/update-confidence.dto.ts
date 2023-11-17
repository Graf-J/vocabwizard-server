import { IsEnum, IsNotEmpty } from "class-validator";
import { Confidence } from "../confidence.enum";

export class UpdateConfidenceDto {
    @IsEnum(Confidence)
    @IsNotEmpty()
    confidence: Confidence;
}
