import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User } from '../users/entities/user.entity.js';
import { Repository } from 'typeorm';
import { RegisterDTO } from './dto/register.dto.js';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { LoginDTO } from './dto/login.dto.js';

import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(@InjectRepository(User)
    private readonly users: Repository<User>,
        private readonly jwtService: JwtService,) { }

    async findByEmail(email: string) {
        const user = await this.users.findOne({ where: { email } });
        if (!user) throw new NotFoundException('User khong tim thay');
        return user;
    }

    async register(dto: RegisterDTO) {
        const email = dto.email.toLowerCase().trim();
        const existingUser = await this.users.findOneBy({ email });
        if (existingUser) {
            throw new ConflictException('Email da duoc dang ki')
        }
        if (Buffer.byteLength(dto.password, 'utf8') > 72) {
            throw new BadRequestException('Mật khẩu quá dài, vui lòng chọn mật khẩu ngắn hơn');
        }
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const id = randomUUID();
        const now = new Date();
        const user = this.users.create({
            id,
            name: dto.name,
            email,
            passwordHash,
            role: Role.CUSTOMER,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        })

        const saveUser = await this.users.save(user)
        return {
            id: saveUser.id,
            name: saveUser.name,
            email: saveUser.email,
            role: saveUser.role

        }
    }
    async login(dto: LoginDTO) {
        const email = dto.email.toLowerCase().trim();
        const user = await this.users.findOne({
            where: { email },
            select: {
                id: true,
                name: true,
                email: true,
                passwordHash: true,
                role: true,
                isActive: true,
            },
        });
        if (!user || !user.isActive) {
            throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
        }
        if (Buffer.byteLength(dto.password, 'utf8') > 72) {
            throw new UnauthorizedException('Mật khẩu quá dài, vui lòng chọn mật khẩu ngắn hơn');
        }
        const passwordMatches = await bcrypt.compare(
            dto.password,
            user.passwordHash
        );
        if (!passwordMatches) {
            throw new UnauthorizedException('Email hoặc mật khẩu không đúng');

        }
        const accessToken = await this.jwtService.signAsync({
            sub: user.id,
            role: user.role
        });
        return {
            accessToken,
            user: {

                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        }

    }
    async getProfile(userId: string) {
        const user = await this.users.findOneBy({ id: userId });

        if (!user || !user.isActive) {
            throw new UnauthorizedException('Tai khoan khong hoat dong');
        }
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };
    }
}


