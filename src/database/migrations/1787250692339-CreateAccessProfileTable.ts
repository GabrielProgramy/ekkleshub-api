import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateAccessProfileTable1787250692339 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: 'access_profile',
				columns: [
					{
						name: 'id',
						type: 'uuid',
						isNullable: false,
						default: 'uuid_generate_v4()',
						isPrimary: true,
					},
					{
						name: 'name',
						type: 'varchar',
						isNullable: false,
						isUnique: true,
					},
					{
						name: 'permissions',
						type: 'jsonb',
					},
					{
						name: 'created_at',
						type: 'timestamp',
						isNullable: false,
						default: 'now()',
					},
					{
						name: 'updated_at',
						type: 'timestamp',
						isNullable: false,
						default: 'now()',
					},
				],
			}),
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable('access_profile');
	}
}
