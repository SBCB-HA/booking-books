
import { Transform } from 'class-transformer'
import { IsString, IsEmail, MinLength, MaxLength, Matches } from 'class-validator'
export class RegisterDTO {
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim() : value,
    )
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    name!: string;

    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim().toLowerCase() : value,
    )
    @IsEmail()
    @MaxLength(254)
    email!: string;

    @IsString()
    @MinLength(8)
    @MaxLength(72)
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, {
        message: 'Mật khẩu cần có chữ cái và chữ số',
    })
    password!: string;

}