import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Room } from '../../../rooms/entites/room.entity/room.entity.js';

@Entity('RoomBlock')
@Index('room_block_room_start_idx', ['roomId', 'startAt'])
@Check(
  'room_block_time_check',
  `isfinite("startAt")
   AND isfinite("endAt")
   AND "endAt" > "startAt"
   AND mod(extract(epoch FROM "startAt"), 900) = 0
   AND mod(extract(epoch FROM "endAt"), 900) = 0`,
)
export class RoomBlock {
  @PrimaryColumn({ type: 'text' })
  id!: string;

  @Column({ type: 'text' })
  roomId!: string;

  @ManyToOne(() => Room, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'roomId' })
  room!: Room;

  @Column({ type: 'timestamptz', precision: 3 })
  startAt!: Date;

  @Column({ type: 'timestamptz', precision: 3 })
  endAt!: Date;

  @Column({ type: 'text', nullable: true })
  reason!: string | null;

  @CreateDateColumn({ type: 'timestamptz', precision: 3 })
  createdAt!: Date;
}