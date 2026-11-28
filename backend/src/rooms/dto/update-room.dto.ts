import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export class UpdateRoomDTO {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @ValidateIf((_, value) => value !== undefined)
  @IsInt()
  @Min(1)
  capacity?: number;

  @ValidateIf((_, value) => value !== undefined)
  @IsInt()
  @Min(0)
  @Max(10_000_000)
  pricePerHour?: number;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @Matches(/^(?:[01]\d|2[0-3]):(?:00|15|30|45)$/, {
    message: 'openTime phải có dạng HH:mm và đúng bước 15 phút',
  })
  openTime?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @Matches(/^(?:[01]\d|2[0-3]):(?:00|15|30|45)$/, {
    message: 'closeTime phải có dạng HH:mm và đúng bước 15 phút',
  })
  closeTime?: string;

  @IsOptional()
  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
    require_tld: false,
  })
  imageUrl?: string | null;
}