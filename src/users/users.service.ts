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

export type UserResponse = Omit<Users, 'password'>;

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(Users)
		private readonly usersRepository: Repository<Users>,
		private readonly accessProfileService: AccessProfileService,
		private readonly passwordHasher: PasswordHasher,
	) {}

	async create(createUserDto: CreateUserDto): Promise<UserResponse> {
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

		const savedUser = await this.usersRepository.save({
			name: createUserDto.name,
			email: createUserDto.email,
			password: passwordHash,
			access_profile_id: accessProfile.id,
			church_id: createUserDto.church_id,
			member_id: createUserDto.member_id,
			status: 'ACTIVE',
		});

		return this.removePassword(savedUser);
	}

	async findOne(userId: string): Promise<UserResponse | null> {
		const user = await this.usersRepository.findOne({ where: { id: userId } });

		return user ? this.removePassword(user) : null;
	}

	async findOneOrFail(userId: string): Promise<UserResponse> {
		const user = await this.findOne(userId);

		if (!user) throw new NotFoundException('Usuário não encontrado!');

		return user;
	}

	async findAll(): Promise<UserResponse[]> {
		const users = await this.usersRepository.find({
			select: {
				id: true,
				name: true,
				email: true,
				status: true,
				access_profile_id: true,
				church_id: true,
				member_id: true,
				last_access_at: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		return users.map((user) => this.removePassword(user));
	}

	async update(
		userId: string,
		updateUserDto: UpdateUserDto,
	): Promise<UserResponse> {
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

		const updatedUser = await this.usersRepository.save(existingUser);

		return this.removePassword(updatedUser);
	}

	async inactiveUser(userId: string): Promise<void> {
		const existingUser = await this.findOneOrFail(userId);

		if (existingUser.status === 'INACTIVE') return;

		existingUser.status = 'INACTIVE';

		await this.usersRepository.save(existingUser);
	}

	private removePassword(user: Users): UserResponse {
		const { password, ...userWithoutPassword } = user;
		void password;

		return userWithoutPassword;
	}
}
