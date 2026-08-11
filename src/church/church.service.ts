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

@Injectable()
export class ChurchService {
	constructor(
		@InjectRepository(Church)
		private readonly churchRepository: Repository<Church>,
	) {}

	async create(createChurchDto: CreateChurchDto): Promise<Church> {
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

	async findAll(): Promise<Church[]> {
		const churches = await this.churchRepository.find();

		return churches;
	}

	async findOne(id: string): Promise<Church | null> {
		return this.churchRepository.findOne({ where: { id } });
	}

	async findOneOrFail(id: string): Promise<Church> {
		const church = await this.findOne(id);

		if (!church) throw new NotFoundException('Igreja não encontrada!');

		return church;
	}

	async update(id: string, updateChurchDto: UpdateChurchDto): Promise<Church> {
		const existingChurch = await this.findOneOrFail(id);

		this.churchRepository.merge(existingChurch, updateChurchDto);

		return this.churchRepository.save(existingChurch);
	}

	async close(id: string): Promise<void> {
		const existingChurch = await this.findOneOrFail(id);

		if (existingChurch.status === ChurchStatus.CLOSED) return;

		existingChurch.status = ChurchStatus.CLOSED;

		await this.churchRepository.save(existingChurch);
	}
}
