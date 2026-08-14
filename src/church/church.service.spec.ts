import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChurchService } from './church.service';
import { Church, ChurchStatus, ChurchType } from './entities/church.entity';
import { CreateChurchDto } from './dto/create-church.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateChurchDto } from './dto/update-church.dto';

describe('ChurchService', () => {
	let service: ChurchService;
	let mockChurchRepository: {
		exists: jest.Mock;
		save: jest.Mock;
		find: jest.Mock;
		findOne: jest.Mock;
		merge: jest.Mock;
	};
	let churchTestData: CreateChurchDto;

	let existingChurchTest: Church;

	beforeEach(async () => {
		mockChurchRepository = {
			exists: jest.fn(),
			save: jest.fn(),
			find: jest.fn(),
			findOne: jest.fn(),
			merge: jest.fn(),
		};

		churchTestData = {
			name: 'Igreja Teste Sede',
			address: {
				city: 'São Paulo',
				number: '20',
				street: 'Rua Alguma coisa',
				state: 'SP',
				zip_code: '00022001',
			},
			type: ChurchType.HEADQUARTERS,
		};

		existingChurchTest = {
			...churchTestData,
			id: 'uuid-teste',
			email: null,
			phone: null,
			status: ChurchStatus.ACTIVE,
			created_at: new Date(),
			updated_at: new Date(),
		};
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ChurchService,
				{
					provide: getRepositoryToken(Church),
					useValue: mockChurchRepository,
				},
			],
		}).compile();

		service = module.get<ChurchService>(ChurchService);
	});

	it('deve impedir a criação de uma segunda igreja matriz', async () => {
		mockChurchRepository.exists.mockResolvedValue(true);

		await expect(service.create(churchTestData)).rejects.toThrow(
			ConflictException,
		);
	});

	it('deve permitir a criação de uma congregação sem consultar a existência de uma matriz duplicada', async () => {
		const congregationData: CreateChurchDto = {
			name: 'Igreja Teste Congregação',
			address: {
				city: 'São Paulo',
				number: '20',
				street: 'Rua Alguma coisa',
				state: 'SP',
				zip_code: '00022001',
			},
			type: ChurchType.CONGREGATION,
		};

		mockChurchRepository.save.mockResolvedValue({
			...congregationData,
			id: 'uuid-teste-congregacao',
			status: ChurchStatus.ACTIVE,
			created_at: new Date(),
			updated_at: new Date(),
		});

		const result = await service.create(congregationData);

		expect(result.type).toEqual(ChurchType.CONGREGATION);
		expect(result.status).toEqual(ChurchStatus.ACTIVE);
		expect(mockChurchRepository.exists).not.toHaveBeenCalled();
		expect(mockChurchRepository.save).toHaveBeenCalled();
	});

	it('deve permitir a criação de uma igreja matriz', async () => {
		mockChurchRepository.exists.mockResolvedValue(false);

		mockChurchRepository.save.mockResolvedValue({
			...churchTestData,
			id: 'uuid-teste',
			status: ChurchStatus.ACTIVE,
			create_at: new Date(),
			updated_at: new Date(),
		});

		const result = await service.create(churchTestData);

		expect(result.type).toBe(ChurchType.HEADQUARTERS);
		expect(result.status).toBe(ChurchStatus.ACTIVE);
		expect(mockChurchRepository.save).toHaveBeenCalled();
	});

	it('deve emitir erro caso não encontre uma igreja', async () => {
		mockChurchRepository.findOne.mockResolvedValue(null);

		await expect(service.findOneOrFail('id')).rejects.toThrow(
			NotFoundException,
		);
	});

	it('deve encontrar uma igreja pelo seu id', async () => {
		const insertedChurch = {
			...churchTestData,
			status: ChurchStatus.ACTIVE,
			created_at: new Date(),
			updated_at: new Date(),
			id: 'uuid-teste',
		};

		mockChurchRepository.findOne.mockResolvedValue(insertedChurch);

		const result = await service.findOneOrFail('uuid-teste');

		expect(result).toEqual(insertedChurch);
	});

	it('deve permitir a atualização de dados de uma igreja', async () => {
		const updatedDataChurch = {
			email: 'churchteste@email.com',
		};

		const mergedDataChurch = {
			...existingChurchTest,
			...updatedDataChurch,
		};

		mockChurchRepository.findOne.mockResolvedValue(existingChurchTest);
		mockChurchRepository.merge.mockImplementation(
			(existing: Church, updated: UpdateChurchDto) => {
				Object.assign(existing, updated);

				return existing;
			},
		);
		mockChurchRepository.save.mockResolvedValue(mergedDataChurch);

		const result = await service.update('uuid-teste', updatedDataChurch);

		expect(result).toEqual(mergedDataChurch);
		expect(mockChurchRepository.merge).toHaveBeenCalledWith(
			existingChurchTest,
			updatedDataChurch,
		);
		expect(mockChurchRepository.save).toHaveBeenCalledWith(existingChurchTest);
	});

	it('deve alterar o status da igreja para CLOSED', async () => {
		mockChurchRepository.findOne.mockResolvedValue(existingChurchTest);

		await service.close('uuid-teste');

		expect(existingChurchTest.status).toEqual(ChurchStatus.CLOSED);
		expect(mockChurchRepository.save).toHaveBeenCalledWith(existingChurchTest);
	});

	it('deve listar as igrejas registradas', async () => {
		const churches: Church[] = [
			existingChurchTest,
			{
				...existingChurchTest,
				id: 'uuid-teste-2',
				name: 'Igreja Teste 2',
				type: ChurchType.CONGREGATION,
			},
		];
		mockChurchRepository.find.mockResolvedValue(churches);

		const result = await service.findAll();

		expect(result).toEqual(churches);
		expect(mockChurchRepository.find).toHaveBeenCalled();
	});

	it('deve ignorar o encerramento de uma igreja já fechada', async () => {
		const closedChurch: Church = {
			...existingChurchTest,
			status: ChurchStatus.CLOSED,
		};

		mockChurchRepository.findOne.mockResolvedValue(closedChurch);

		await service.close('uuid-teste');

		expect(mockChurchRepository.save).not.toHaveBeenCalled();
	});
});
