import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { randomUUID } from 'node:crypto';
import { Provider } from './entites/providers.entity.js';
import { CreateProviderDTO } from './dto/create-provider.dto.js';
import { UpdateProviderDTO } from './dto/update-provider.dto.js';

const NOT_FOUND = 'Không tìm thấy Provider';
const DUPLICATE = 'Email hoặc số điện thoại đã được sử dụng';

@Injectable()
export class ProvidersService {
    constructor(
        @InjectRepository(Provider)
        private readonly providers: Repository<Provider>,
    ) { }

    async findAll() {
        return this.providers.find({ where: { isActive: true } });
    }

    async findProvider(id: string) {
        const provider = await this.providers.findOneBy({ id, isActive: true });
        if (!provider) {
            throw new NotFoundException(NOT_FOUND);
        }
        return provider;
    }

    async createProvider(dto: CreateProviderDTO) {
        const email = dto.email.trim().toLowerCase();
        const phone = dto.phone.trim();

        if (await this.providers.findOneBy([{ email }, { phone }])) {
            throw new ConflictException(DUPLICATE);
        }

        const provider = this.providers.create({
            id: randomUUID(),
            name: dto.name,
            email,
            phone,
            description: dto.description,
            address: dto.address,
            isActive: true,
        });

        try {
            return await this.providers.save(provider);
        } catch (error) {
            this.rethrowDatabaseError(error);
        }
    }

    async updateProvider(dto: UpdateProviderDTO, id: string) {
        const changes = {
            name: dto.name,
            email: dto.email?.trim().toLowerCase(),
            phone: dto.phone?.trim(),
            description: dto.description,
            address: dto.address,
        };

        if (!Object.values(changes).some((value) => value !== undefined)) {
            throw new BadRequestException('Cần ít nhất một trường để cập nhật');
        }

        if ([dto.name, dto.email, dto.phone, dto.address].some((value) => value === null)) {
            throw new BadRequestException('Tên, email, số điện thoại và địa chỉ không được là null');
        }

        // Chỉ ghi những trường được gửi lên
        const definedChanges = Object.fromEntries(
            Object.entries(changes).filter(([, value]) => value !== undefined),
        );

        try {
            return await this.providers.manager.transaction(async (manager) => {
                const repository = manager.getRepository(Provider);

                const existing = await repository.findOne({
                    where: { id },
                    lock: { mode: 'pessimistic_write' },
                });

                if (!existing) {
                    throw new NotFoundException(NOT_FOUND);
                }

                if (changes.email !== undefined) {
                    const other = await repository.findOneBy({ email: changes.email });
                    if (other && other.id !== id) {
                        throw new ConflictException('Email đã được sử dụng');
                    }
                }

                if (changes.phone !== undefined) {
                    const other = await repository.findOneBy({ phone: changes.phone });
                    if (other && other.id !== id) {
                        throw new ConflictException('Số điện thoại đã được sử dụng');
                    }
                }

                await repository.update({ id }, definedChanges);

                return repository.findOneByOrFail({ id });
            });
        } catch (error) {
            this.rethrowDatabaseError(error);
        }
    }

    async deleteProvider(id: string): Promise<void> {
        // Một câu UPDATE, không đọc trước; xóa lại cùng ID vẫn thành công
        const result = await this.providers.update({ id }, { isActive: false });

        if (!result.affected) {
            throw new NotFoundException(NOT_FOUND);
        }
    }

    private rethrowDatabaseError(error: unknown): never {
        if (
            error instanceof QueryFailedError &&
            (error.driverError as { code?: string }).code === '23505'
        ) {
            throw new ConflictException(DUPLICATE);
        }
        throw error;
    }
}