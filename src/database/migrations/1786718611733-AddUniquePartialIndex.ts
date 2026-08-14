import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class AddUniquePartialIndex1786718611733 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createIndex(
			'church',
			new TableIndex({
				name: 'IDX_church_unique_headquarters',
				columnNames: ['type'],
				isUnique: true,
				where: `"type" = 'HEADQUARTERS'`,
			}),
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropIndex('church', 'IDX_church_unique_headquarters');
	}
}
