import { Test, TestingModule } from '@nestjs/testing';
import { ChurchController } from './church.controller';
import { ChurchService } from './church.service';
import { CreateChurchDto } from './dto/create-church.dto';
import { Church, ChurchStatus, ChurchType } from './entities/church.entity';
import { UpdateChurchDto } from './dto/update-church.dto';

describe('ChurchController', () => {
	let controller: ChurchController;
	let mockChurchService: {
		create: jest.Mock;
		findAll: jest.Mock;
		findOneOrFail: jest.Mock;
		update: jest.Mock;
		close: jest.Mock;
	};

	beforeEach(async () => {
		mockChurchService = {
			create: jest.fn(),
			findAll: jest.fn(),
			findOneOrFail: jest.fn(),
			update: jest.fn(),
			close: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [ChurchController],
			providers: [
				{
					provide: ChurchService,
					useValue: mockChurchService,
				},
			],
		}).compile();

		controller = module.get<ChurchController>(ChurchController);
	});

	it('deve ser possivel criar uma nova igreja', async () => {
		const newChurchData: CreateChurchDto = {
			name: 'Igreja Teste',
			address: {
				city: 'São Paulo',
				number: '49',
				state: 'São Paulo',
				street: 'Rua Santo Teste',
				zip_code: '01234321',
			},
			type: ChurchType.HEADQUARTERS,
		};

		const newChurch: Church = {
			...newChurchData,
			id: 'uuid-test',
			phone: null,
			email: null,
			status: ChurchStatus.ACTIVE,
			created_at: new Date(),
			updated_at: new Date(),
		};
		mockChurchService.create.mockResolvedValue(newChurch);

		const result = await controller.create(newChurchData);

		expect(result).toEqual(newChurch);
		expect(mockChurchService.create).toHaveBeenCalledWith(newChurchData);
	});

	it('deve ser possivel listar todas as igrejas registradas', async () => {
		const churches: Church[] = [
			{
				id: 'uuid-teste-1',
				name: 'Igreja Teste 1',
				address: {
					city: 'São Paulo',
					number: '49',
					state: 'São Paulo',
					street: 'Rua Santo Teste',
					zip_code: '01234321',
				},
				type: ChurchType.HEADQUARTERS,
				phone: null,
				email: 'igrejateste@email.com',
				status: ChurchStatus.ACTIVE,
				created_at: new Date(),
				updated_at: new Date(),
			},
			{
				id: 'uuid-teste-2',
				name: 'Igreja Teste 2',
				address: {
					city: 'São Paulo',
					number: '49',
					state: 'São Paulo',
					street: 'Rua Santo Teste 2',
					zip_code: '01234321',
				},
				type: ChurchType.CONGREGATION,
				phone: null,
				email: 'igrejateste2@email.com',
				status: ChurchStatus.ACTIVE,
				created_at: new Date(),
				updated_at: new Date(),
			},
			{
				id: 'uuid-teste-3',
				name: 'Igreja Teste 3',
				address: {
					city: 'São Paulo',
					number: '49',
					state: 'São Paulo',
					street: 'Rua Santo Teste 3',
					zip_code: '01234321',
				},
				type: ChurchType.CONGREGATION,
				phone: null,
				email: '',
				status: ChurchStatus.CLOSED,
				created_at: new Date(),
				updated_at: new Date(),
			},
		];

		mockChurchService.findAll.mockResolvedValue(churches);

		const result = await controller.findAll();

		expect(result).toEqual(churches);
		expect(mockChurchService.findAll).toHaveBeenCalled();
	});

	it('deve ser possivel retornar uma igreja por seu id', async () => {
		const churchId = 'uuid-teste-1';

		const church: Church = {
			id: churchId,
			name: 'Igreja Teste 1',
			address: {
				city: 'São Paulo',
				number: '49',
				state: 'São Paulo',
				street: 'Rua Santo Teste',
				zip_code: '01234321',
			},
			type: ChurchType.HEADQUARTERS,
			phone: null,
			email: null,
			status: ChurchStatus.ACTIVE,
			created_at: new Date(),
			updated_at: new Date(),
		};

		mockChurchService.findOneOrFail.mockResolvedValue(church);

		const result = await controller.findOne(churchId);

		expect(result).toEqual(church);
		expect(mockChurchService.findOneOrFail).toHaveBeenCalledWith(churchId);
	});

	it('deve ser possivel alterar dados de uma igreja por seu id', async () => {
		const churchId = 'uuid-teste-1';
		const church: Church = {
			id: churchId,
			name: 'Igreja Teste 1',
			address: {
				city: 'São Paulo',
				number: '49',
				state: 'São Paulo',
				street: 'Rua Santo Teste',
				zip_code: '01234321',
			},
			type: ChurchType.HEADQUARTERS,
			phone: null,
			email: null,
			status: ChurchStatus.ACTIVE,
			created_at: new Date(),
			updated_at: new Date(),
		};

		const updatedData: UpdateChurchDto = {
			email: 'email@igrejateste.com',
		};

		const churchUpdated: Church = {
			...church,
			...updatedData,
		};

		mockChurchService.update.mockResolvedValue(churchUpdated);

		const result = await controller.update(churchId, updatedData);

		expect(result).toEqual(churchUpdated);
		expect(mockChurchService.update).toHaveBeenCalledWith(
			churchId,
			updatedData,
		);
	});

	it('deve ser possivel fechar uma igreja, alterando seu status', async () => {
		const churchId = 'uuid-teste-1';

		await controller.close(churchId);

		expect(mockChurchService.close).toHaveBeenCalledTimes(1);
		expect(mockChurchService.close).toHaveBeenCalledWith(churchId);
	});
});
