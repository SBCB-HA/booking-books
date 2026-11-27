
import { Entity, Column, CreateDateColumn, PrimaryColumn, UpdateDateColumn } from "typeorm";



@Entity('Providers')
export class Provider {
    @PrimaryColumn({ type: 'text' })
    id: string

    @Column({ type: 'text' })
    name: string

    @Column({ type: 'text', nullable: true })
    description: string | null;
    @Column({ type: 'text', unique: true })
    email: string

    @Column({ type: 'text', unique: true })
    phone: string

    @Column({ type: 'text' })
    address: string

    @Column({ type: 'boolean', default: true })
    isActive: boolean

    @CreateDateColumn({ type: 'timestamp', precision: 3 })
    createdAt: Date

    @UpdateDateColumn({ type: 'timestamp', precision: 3 })
    updatedAt: Date;
}