import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class UpdateMovieDTO {
    @IsNotEmpty()
    @IsOptional()
    title?: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsNumber({}, {each: true})
    @IsOptional()
    genreIds?: number[];

    @IsNotEmpty()
    @IsOptional()
    detail?: string;

    @IsNotEmpty()
    @IsOptional()
    directorId?: number;
}