import { PartialType } from "@nestjs/mapped-types";
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { CreateMovieDTO } from "./create-movie.dto";

export class UpdateMovieDTO extends PartialType(CreateMovieDTO) {}