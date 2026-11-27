import { ConflictException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from './entites/providers.entity.js';
import { CreateProviderDTO } from './dto/create-provider.dto.js';
import { randomUUID } from 'crypto';
import { UpdateProviderDTO } from './dto/update-provider.dto.js';
import { QueryFailedError } from 'typeorm';
@Injectable()
export class ProvidersService {

    constructor(
        @InjectRepository(Provider) private readonly providers: Repository<Provider>) { }

    async findAll() {
        const pro = await this.providers.find({
            where: { isActive: true },
        });
        return pro;
    }
    async findProvider(id: string) {
        const provider = await this.providers.findOneBy({ // findBy tra ve 1 mang , chi tiet phai findOneBy
            id,
        })
        if (!provider) {
            throw new NotFoundException('KHONG TIM THAY PROVIDER');
        }
        return provider;
    }
    async createProvider(dto: CreateProviderDTO) {
        const a = await this.providers.findBy(
            [{ phone: dto.phone }, { email: dto.email }]
        )
        if (a.length > 0) {
            throw new ConflictException("DA CO SO DIEN THOAI OR EMAIL");
        }
        const id = randomUUID();
        const provider = this.providers.create(
            {
                id,
                name: dto.name,
                email: dto.email,
                phone: dto.phone,
                description: dto.description,
                address: dto.address,
                isActive: true,


            }
        )
        const savedProvider = await this.providers.save(provider);
        return savedProvider;
    }
    async updateProvider(dto: UpdateProviderDTO, id: string) {
        const provider = await this.providers.findOneBy({ id });

        if (!provider) {
            throw new NotFoundException('Không tìm thấy Provider');
        }

        const hasUpdate = [
            dto.name,
            dto.email,
            dto.phone,
            dto.description,
            dto.address,
        ].some((value) => value !== undefined);

        if (!hasUpdate) {
            throw new BadRequestException('Cần ít nhất một trường để cập nhật');
        }

        if (dto.email !== undefined) {
            const existing = await this.providers.findOneBy({
                email: dto.email,
            });

            if (existing && existing.id !== id) {
                throw new ConflictException('Email đã được sử dụng');
            }
        }

        if (dto.phone !== undefined) {
            const existing = await this.providers.findOneBy({
                phone: dto.phone,
            });

            if (existing && existing.id !== id) {
                throw new ConflictException('Số điện thoại đã được sử dụng');
            }
        }

        if (dto.name !== undefined) provider.name = dto.name;
        if (dto.email !== undefined) provider.email = dto.email;
        if (dto.phone !== undefined) provider.phone = dto.phone;
        if (dto.description !== undefined) {
            provider.description = dto.description;
        }
        if (dto.address !== undefined) provider.address = dto.address;

        try {
            return await this.providers.save(provider);
        } catch (error) {
            if (
                error instanceof QueryFailedError &&
                (error.driverError as { code?: string }).code === '23505'
            ) {
                throw new ConflictException('Email hoặc số điện thoại đã được sử dụng');
            }

            throw error;
        }

    }
    async deleteProvider(id: string): Promise<void> {
        const provider = await this.providers.findOneBy({ id });

        if (!provider) {
            throw new NotFoundException('Không tìm thấy Provider');
        }

        if (!provider.isActive) {
            return;
        }

        provider.isActive = false;
        await this.providers.save(provider);
    }
}
