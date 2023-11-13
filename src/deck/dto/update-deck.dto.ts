import { IsInt, IsNotEmpty, IsString, Min, MinLength } from 'class-validator';

export class UpdateDeckDto {
    @IsString()
    @MinLength(4)
    @IsNotEmpty()
    name: string;

    @IsInt()
    @Min(1)
    @IsNotEmpty()
    learningRate: number;
}
