import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAccessProfileDto } from './dto/create-access-profile.dto';
import { AccessProfile } from './entities/access-profile.entity';
import { Not, Repository } from 'typeorm';
import { UpdateAccessProfileDto } from './dto/update-access-profile.dto';

@Injectable()
export class AccessProfileService {
	constructor(
		@InjectRepository(AccessProfile)
		private readonly accessProfileRepository: Repository<AccessProfile>,
	) {}

	async create(
		createAccessProfileDto: CreateAccessProfileDto,
	): Promise<AccessProfile> {
		const alreadyExistsAccessProfile =
			await this.accessProfileRepository.exists({
				where: {
					name: createAccessProfileDto.name,
				},
			});

		if (alreadyExistsAccessProfile)
			throw new ConflictException('O perfil de acesso já existe');

		return this.accessProfileRepository.save(createAccessProfileDto);
	}

	async findAll(): Promise<AccessProfile[]> {
		return this.accessProfileRepository.find();
	}

	async findOne(accessProfileId: string): Promise<AccessProfile | null> {
		return this.accessProfileRepository.findOne({
			where: {
				id: accessProfileId,
			},
		});
	}

	async findOneOrFail(accessProfileId: string): Promise<AccessProfile> {
		const accessProfile = await this.findOne(accessProfileId);

		if (!accessProfile)
			throw new NotFoundException('O perfil de acesso não existe!');

		return accessProfile;
	}

	async update(
		accessProfileId: string,
		updateData: UpdateAccessProfileDto,
	): Promise<AccessProfile> {
		const existingAccessProfile = await this.findOneOrFail(accessProfileId);

		if (updateData.name) {
			const existingAccessProfileName =
				await this.accessProfileRepository.exists({
					where: {
						id: Not(accessProfileId),
						name: updateData.name,
					},
				});

			if (existingAccessProfileName)
				throw new ConflictException(
					'O nome do perfil de acesso já está cadastrado!',
				);
		}

		this.accessProfileRepository.merge(existingAccessProfile, updateData);

		await this.accessProfileRepository.save(existingAccessProfile);

		return existingAccessProfile;
	}

	async deleteOne(accessProfileId: string): Promise<void> {
		await this.accessProfileRepository.delete(accessProfileId);
	}
}
