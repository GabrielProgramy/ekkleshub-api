import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { CreateChurchDto } from './dto/create-church.dto';
import { UpdateChurchDto } from './dto/update-church.dto';
import { Repository } from 'typeorm';
import { Church, ChurchStatus, ChurchType } from './entities/church.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AccessProfileService } from '../access-profile/access-profile.service';
import { assertPermission } from '../common/security/authorization-policy';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import {
	PermissionLevel,
	PermissionModule,
	PermissionScope,
} from '../access-profile/entities/access-profile.entity';

@Injectable()
export class ChurchService {
	constructor(
		@InjectRepository(Church)
		private readonly churchRepository: Repository<Church>,
		private readonly accessProfileService: AccessProfileService,
	) {}

	async create(
		createChurchDto: CreateChurchDto,
		user?: AuthenticatedUser,
	): Promise<Church> {
		await assertPermission(
			this.accessProfileService,
			user,
			PermissionModule.CHURCHES,
			PermissionLevel.FULL,
		);
		if (createChurchDto.type === ChurchType.HEADQUARTERS) {
			const alreadyExistsChurchofTypeHQ = await this.churchRepository.exists({
				where: {
					type: ChurchType.HEADQUARTERS,
				},
			});

			if (alreadyExistsChurchofTypeHQ)
				throw new ConflictException('Igreja Matriz já existente!');
		}

		const newChurchData = {
			...createChurchDto,
			status: ChurchStatus.ACTIVE,
		};

		return this.churchRepository.save(newChurchData);
	}

	async findAll(user?: AuthenticatedUser): Promise<Church[]> {
		await assertPermission(
			this.accessProfileService,
			user,
			PermissionModule.CHURCHES,
			PermissionLevel.READ,
		);
		const permission =
			user &&
			(await this.accessProfileService.findOne(user.accessProfileId))
				?.permissions?.[PermissionModule.CHURCHES];
		const churches = await this.churchRepository.find(
			permission?.scope === PermissionScope.OWN_CHURCH && user?.churchId
				? { where: { id: user.churchId } }
				: undefined,
		);

		return churches;
	}

	async findOne(id: string, user?: AuthenticatedUser): Promise<Church | null> {
		await assertPermission(
			this.accessProfileService,
			user,
			PermissionModule.CHURCHES,
			PermissionLevel.READ,
			id,
		);
		return this.churchRepository.findOne({ where: { id } });
	}

	async findOneOrFail(id: string, user?: AuthenticatedUser): Promise<Church> {
		const church = await this.findOne(id, user);

		if (!church) throw new NotFoundException('Igreja não encontrada!');

		return church;
	}

	async update(
		id: string,
		updateChurchDto: UpdateChurchDto,
		user?: AuthenticatedUser,
	): Promise<Church> {
		await assertPermission(
			this.accessProfileService,
			user,
			PermissionModule.CHURCHES,
			PermissionLevel.FULL,
			id,
		);
		const existingChurch = await this.findOneOrFail(id);

		this.churchRepository.merge(existingChurch, updateChurchDto);

		return this.churchRepository.save(existingChurch);
	}

	async close(id: string, user?: AuthenticatedUser): Promise<void> {
		await assertPermission(
			this.accessProfileService,
			user,
			PermissionModule.CHURCHES,
			PermissionLevel.FULL,
			id,
		);
		const existingChurch = await this.findOneOrFail(id);

		if (existingChurch.status === ChurchStatus.CLOSED) return;

		existingChurch.status = ChurchStatus.CLOSED;

		await this.churchRepository.save(existingChurch);
	}
}
