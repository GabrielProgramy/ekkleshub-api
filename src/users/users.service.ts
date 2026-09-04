import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { AccessProfileService } from '../access-profile/access-profile.service';
import { PasswordHasher } from '../common/security/password-hasher';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Users } from './entities/users.entity';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(Users)
		private readonly usersRepository: Repository<Users>,
		private readonly accessProfileService: AccessProfileService,
		private readonly passwordHasher: PasswordHasher,
	) {}

	async create(createUserDto: CreateUserDto): Promise<Users> {
		const userWithSameEmail = await this.usersRepository.exists({
			where: { email: createUserDto.email },
		});

		if (userWithSameEmail)
			throw new ConflictException('O email já está cadastrado!');

		const accessProfile = await this.accessProfileService.findOneOrFail(
			createUserDto.access_profile_id,
		);

		if (accessProfile.name === 'OWNER') {
			const ownerAlreadyExists = await this.usersRepository.exists({
				where: { access_profile_id: accessProfile.id },
			});

			if (ownerAlreadyExists)
				throw new ConflictException('Já existe um usuário com perfil OWNER!');
		}

		const passwordHash = await this.passwordHasher.hash(createUserDto.password);

		return this.usersRepository.save({
			name: createUserDto.name,
			email: createUserDto.email,
			password: passwordHash,
			access_profile_id: accessProfile.id,
			church_id: createUserDto.church_id,
			member_id: createUserDto.member_id,
			status: 'ACTIVE',
		});
	}

	async findOne(userId: string): Promise<Users | null> {
		return this.usersRepository.findOne({ where: { id: userId } });
	}

	async findOneOrFail(userId: string): Promise<Users> {
		const user = await this.findOne(userId);

		if (!user) throw new NotFoundException('Usuário não encontrado!');

		return user;
	}

	async findAll(): Promise<Users[]> {
		return this.usersRepository.find();
	}

	async update(userId: string, updateUserDto: UpdateUserDto): Promise<Users> {
		const existingUser = await this.findOneOrFail(userId);

		if (updateUserDto.email) {
			const userWithSameEmail = await this.usersRepository.exists({
				where: {
					id: Not(userId),
					email: updateUserDto.email,
				},
			});

			if (userWithSameEmail)
				throw new ConflictException('O email já está cadastrado!');
		}

		if (updateUserDto.access_profile_id) {
			const accessProfile = await this.accessProfileService.findOneOrFail(
				updateUserDto.access_profile_id,
			);

			if (accessProfile.name === 'OWNER') {
				const ownerAlreadyExists = await this.usersRepository.exists({
					where: { access_profile_id: accessProfile.id },
				});

				if (ownerAlreadyExists)
					throw new ConflictException('Já existe um usuário com perfil OWNER!');
			}
		}

		const userDataToUpdate = { ...updateUserDto };

		if (updateUserDto.password) {
			userDataToUpdate.password = await this.passwordHasher.hash(
				updateUserDto.password,
			);
		}

		this.usersRepository.merge(existingUser, userDataToUpdate);

		return this.usersRepository.save(existingUser);
	}

	async inactiveUser(userId: string): Promise<void> {
		const existingUser = await this.findOneOrFail(userId);

		if (existingUser.status === 'INACTIVE') return;

		existingUser.status = 'INACTIVE';

		await this.usersRepository.save(existingUser);
	}
}
