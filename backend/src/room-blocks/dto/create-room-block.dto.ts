import { Transform } from 'class-transformer';
import {
  IsISO8601,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

// Nhận ngày giờ có giây, tối đa 3 chữ số thập phân
// và bắt buộc có múi giờ: Z hoặc +07:00.
const DATE_TIME_WITH_OFFSET =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;

export class CreateRoomBlockDTO {
  @IsISO8601({ strict: true, strictSeparator: true })
  @Matches(DATE_TIME_WITH_OFFSET, {
    message: 'startAt phải có ngày giờ và múi giờ, ví dụ 2026-11-30T14:00:00+07:00',
  })
  startAt!: string;

  @IsISO8601({ strict: true, strictSeparator: true })
  @Matches(DATE_TIME_WITH_OFFSET, {
    message: 'endAt phải có ngày giờ và múi giờ, ví dụ 2026-11-30T16:00:00+07:00',
  })
  endAt!: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string | null;
}