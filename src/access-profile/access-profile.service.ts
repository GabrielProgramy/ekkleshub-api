import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAccessProfileDto } from './dto/create-access-profile.dto';
import { AccessProfile } from './entities/access-profile.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AccessProfileService {
	constructor(
		@InjectRepository(AccessProfile)
		private readonly accessProfileRepository: Repository<AccessProfile>,
	) {}

	async create(createAccessProfileDto: CreateAccessProfileDto) {
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
}
