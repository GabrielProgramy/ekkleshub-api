import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAccessProfileDto } from './dto/create-access-profile.dto';
import { AccessProfile, Permission } from './entities/access-profile.entity';
import { Not, Repository } from 'typeorm';
import { UpdateAccessProfileDto } from './dto/update-access-profile.dto';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { assertPermission } from '../common/security/authorization-policy';
import {
	PermissionLevel,
	PermissionModule,
} from './entities/access-profile.entity';

@Injectable()
export class AccessProfileService {
	constructor(
		@InjectRepository(AccessProfile)
		private readonly accessProfileRepository: Repository<AccessProfile>,
	) {}

	async create(
		createAccessProfileDto: CreateAccessProfileDto,
		authenticatedUser?: AuthenticatedUser,
		permissions?: Permission,
	): Promise<AccessProfile> {
		assertPermission(
			permissions,
			authenticatedUser,
			PermissionModule.ACCESS_PROFILES,
			PermissionLevel.FULL,
		);
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

	async findAll(
		authenticatedUser?: AuthenticatedUser,
		permissions?: Permission,
	): Promise<AccessProfile[]> {
		assertPermission(
			permissions,
			authenticatedUser,
			PermissionModule.ACCESS_PROFILES,
			PermissionLevel.READ,
		);
		return this.accessProfileRepository.find();
	}

	async findOne(
		accessProfileId: string,
		authenticatedUser?: AuthenticatedUser,
		permissions?: Permission,
	): Promise<AccessProfile | null> {
		assertPermission(
			permissions,
			authenticatedUser,
			PermissionModule.ACCESS_PROFILES,
			PermissionLevel.READ,
		);
		return this.accessProfileRepository.findOne({
			where: {
				id: accessProfileId,
			},
		});
	}

	async findOneOrFail(
		accessProfileId: string,
		authenticatedUser?: AuthenticatedUser,
		permissions?: Permission,
	): Promise<AccessProfile> {
		const accessProfile = await this.findOne(
			accessProfileId,
			authenticatedUser,
			permissions,
		);

		if (!accessProfile)
			throw new NotFoundException('O perfil de acesso não existe!');

		return accessProfile;
	}

	async update(
		accessProfileId: string,
		{ name, permissions }: UpdateAccessProfileDto,
		authenticatedUser?: AuthenticatedUser,
		permissionsUser?: Permission,
	): Promise<AccessProfile> {
		assertPermission(
			permissionsUser,
			authenticatedUser,
			PermissionModule.ACCESS_PROFILES,
			PermissionLevel.FULL,
		);
		const existingAccessProfile = await this.findOneOrFail(accessProfileId);

		if (name) {
			const existingAccessProfileName =
				await this.accessProfileRepository.exists({
					where: {
						id: Not(accessProfileId),
						name: name,
					},
				});

			if (existingAccessProfileName)
				throw new ConflictException(
					'O nome do perfil de acesso já está cadastrado!',
				);

			existingAccessProfile.name = name;
		}

		if (permissions) {
			existingAccessProfile.permissions = {
				...existingAccessProfile.permissions,
				...permissions,
			};
		}

		await this.accessProfileRepository.save(existingAccessProfile);

		return existingAccessProfile;
	}

	async deleteOne(
		accessProfileId: string,
		authenticatedUser?: AuthenticatedUser,
		permissions?: Permission,
	): Promise<void> {
		assertPermission(
			permissions,
			authenticatedUser,
			PermissionModule.ACCESS_PROFILES,
			PermissionLevel.FULL,
		);
		await this.accessProfileRepository.delete(accessProfileId);
	}
}
