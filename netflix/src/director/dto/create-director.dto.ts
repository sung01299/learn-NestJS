import { IsDateString, IsNotEmpty } from "class-validator";
import { Column } from "typeorm";

export class CreateDirectorDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @IsDateString()
    dob: Date;

    @IsNotEmpty()
    nationality: string;
}
