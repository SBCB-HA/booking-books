import {
    ConflictException,
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { QueryFailedError, Repository } from 'typeorm';
import { randomUUID } from 'node:crypto';
import * as bcrypt from 'bcrypt';
import { Role, User } from '../users/entities/user.entity.js';
import { RegisterDTO } from './dto/register.dto.js';
import { LoginDTO } from './dto/login.dto.js';

const SALT_ROUNDS = 12;
const MAX_PASSWORD_BYTES = 72;
const INVALID_CREDENTIALS = 'Email hoặc mật khẩu không đúng';
const EMAIL_TAKEN = 'Email đã được đăng ký';
// Dùng khi không tìm thấy user, để thời gian phản hồi tương đương
const DUMMY_HASH = bcrypt.hashSync('dummy-password', SALT_ROUNDS);

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly users: Repository<User>,
        private readonly jwtService: JwtService,
    ) { }

    async findByEmail(email: string) {
        const user = await this.users.findOne({
            where: { email: this.normalizeEmail(email) },
        });
        if (!user) {
            throw new NotFoundException('Không tìm thấy người dùng');
        }
        return this.toResponse(user);
    }

    async register(dto: RegisterDTO) {
        const email = this.normalizeEmail(dto.email);

        if (this.isPasswordTooLong(dto.password)) {
            throw new BadRequestException('Mật khẩu quá dài, vui lòng chọn mật khẩu ngắn hơn');
        }

        if (await this.users.findOneBy({ email })) {
            throw new ConflictException(EMAIL_TAKEN);
        }

        const now = new Date();
        const user = this.users.create({
            id: randomUUID(),
            name: dto.name,
            email,
            passwordHash: await bcrypt.hash(dto.password, SALT_ROUNDS),
            role: Role.CUSTOMER,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        });

        try {
            return this.toResponse(await this.users.save(user));
        } catch (error) {
            // Hai request đăng ký cùng lúc: cần unique constraint trên email
            if (
                error instanceof QueryFailedError &&
                (error.driverError as { code?: string }).code === '23505'
            ) {
                throw new ConflictException(EMAIL_TAKEN);
            }
            throw error;
        }
    }

    async login(dto: LoginDTO) {
        if (this.isPasswordTooLong(dto.password)) {
            throw new UnauthorizedException(INVALID_CREDENTIALS);
        }

        const user = await this.users.findOne({
            where: { email: this.normalizeEmail(dto.email) },
            select: {
                id: true,
                name: true,
                email: true,
                passwordHash: true,
                role: true,
                isActive: true,
            },
        });

        const passwordMatches = await bcrypt.compare(
            dto.password,
            user?.passwordHash ?? DUMMY_HASH,
        );

        if (!user || !user.isActive || !passwordMatches) {
            throw new UnauthorizedException(INVALID_CREDENTIALS);
        }

        const accessToken = await this.jwtService.signAsync({
            sub: user.id,
            role: user.role,
        });

        return { accessToken, user: this.toResponse(user) };
    }

    async getProfile(userId: string) {
        const user = await this.users.findOneBy({ id: userId });

        if (!user || !user.isActive) {
            throw new UnauthorizedException('Tài khoản không hoạt động');
        }

        return this.toResponse(user);
    }

    private normalizeEmail(email: string): string {
        return email.trim().toLowerCase();
    }

    private isPasswordTooLong(password: string): boolean {
        return Buffer.byteLength(password, 'utf8') > MAX_PASSWORD_BYTES;
    }

    private toResponse(user: User) {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        };
    }
}