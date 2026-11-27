

import { Entity, Column, PrimaryColumn } from 'typeorm'
import {
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Role {
    CUSTOMER = 'CUSTOMER',
    STAFF = 'STAFF',
    ADMIN = 'ADMIN',
}
@Entity('User')
export class User {

    @PrimaryColumn({ type: 'text' })
    id: string;
    @Column({ type: 'text' })
    name: string

    @Column({ type: 'text', unique: true })
    email: string

    @Column({ type: 'text', select :false })
    passwordHash: string

    @Column({ type: 'enum', default: Role.CUSTOMER, enum: Role, enumName: 'Role' })
    role: Role;

    @Column({ type: 'boolean', default: true })
    isActive: boolean
    @CreateDateColumn({ type: 'timestamp', precision: 3 })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp', precision: 3 })
    updatedAt!: Date;
}