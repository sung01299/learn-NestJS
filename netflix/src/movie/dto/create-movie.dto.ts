import { ArrayNotEmpty, IsAlpha, IsArray, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateMovieDTO {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    detail: string;

    @IsNotEmpty()
    @IsNumber()
    directorId: number;

    @IsArray()
    @ArrayNotEmpty()
    @IsNumber({}, {each: true})
    genreIds: number[]
}