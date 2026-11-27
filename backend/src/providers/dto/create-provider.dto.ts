import { IsEmail, MaxLength, IsNotEmpty, IsString, IsOptional } from "class-validator"
import { Transform } from 'class-transformer'
export class CreateProviderDTO {
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim() : value,
    )
    @IsString()
    @IsNotEmpty()
    name: string

    @IsOptional()
    @IsString()
    descrption: string

    @IsEmail()
    @MaxLength(254)
    email: string

    @IsString()
    @IsNotEmpty()
    phone: string

    @IsOptional()
    @IsString()
    description: string

    @IsString()
    @IsNotEmpty()
    address: string
}