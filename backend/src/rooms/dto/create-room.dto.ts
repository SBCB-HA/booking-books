import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateRoomDTO {
  @IsUUID()
  providerId!: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsInt()
  @Min(1)
  capacity!: number;

  @IsInt()
  @Min(0)
  @Max(10_000_000)
  pricePerHour!: number;

  @IsString()
  @Matches(/^(?:[01]\d|2[0-3]):(?:00|15|30|45)$/, {
    message: 'openTime phải có dạng HH:mm và đúng bước 15 phút',
  })
  openTime!: string;

  @IsString()
  @Matches(/^(?:[01]\d|2[0-3]):(?:00|15|30|45)$/, {
    message: 'closeTime phải có dạng HH:mm và đúng bước 15 phút',
  })
  closeTime!: string;

  @IsOptional()
  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
    require_tld: false,
  })
  imageUrl?: string | null;
}