import { Transform } from 'class-transformer'
import { IsString, IsEmail, IsNotEmpty } from 'class-validator'
export class LoginDTO {
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim().toLowerCase() : value,
    )
    @IsEmail()
    email!: string;
    @IsString()
    @IsNotEmpty()
    password!: string;

}