import {
	MigrationInterface,
	QueryRunner,
	Table,
	TableForeignKey,
} from 'typeorm';

export class CreateUsersTable1788645194382 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: 'users',
				columns: [
					{
						name: 'id',
						type: 'uuid',
						isPrimary: true,
						isNullable: false,
						default: 'uuid_generate_v4()',
					},
					{
						name: 'name',
						type: 'varchar',
						isNullable: false,
					},
					{
						name: 'email',
						type: 'varchar',
						isNullable: false,
						isUnique: true,
					},
					{
						name: 'password',
						type: 'varchar',
						isNullable: false,
					},
					{
						name: 'status',
						type: 'varchar',
						isNullable: false,
					},
					{
						name: 'access_profile_id',
						type: 'uuid',
						isNullable: false,
					},
					{
						name: 'church_id',
						type: 'uuid',
						isNullable: true,
					},
					{
						name: 'member_id',
						type: 'uuid',
						isNullable: true,
					},
					{
						name: 'last_access_at',
						type: 'timestamp',
						isNullable: true,
					},
					{
						name: 'createdAt',
						type: 'timestamp',
						isNullable: false,
						default: 'now()',
					},
					{
						name: 'updatedAt',
						type: 'timestamp',
						isNullable: false,
						default: 'now()',
					},
				],
			}),
		);

		await queryRunner.createForeignKey(
			'users',
			new TableForeignKey({
				name: 'FK_users_access_profile',
				columnNames: ['access_profile_id'],
				referencedTableName: 'access_profile',
				referencedColumnNames: ['id'],
			}),
		);

		await queryRunner.createForeignKey(
			'users',
			new TableForeignKey({
				name: 'FK_users_church',
				columnNames: ['church_id'],
				referencedTableName: 'church',
				referencedColumnNames: ['id'],
			}),
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropForeignKey('users', 'FK_users_church');
		await queryRunner.dropForeignKey('users', 'FK_users_access_profile');
		await queryRunner.dropTable('users');
	}
}
