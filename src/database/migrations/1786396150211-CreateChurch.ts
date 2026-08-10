import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateChurch1786396150211 implements MigrationInterface {
	name = 'CreateChurch1786396150211';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TYPE "public"."church_type_enum" AS ENUM('HEADQUARTERS', 'CONGREGATION')`,
		);
		await queryRunner.query(
			`CREATE TYPE "public"."church_status_enum" AS ENUM('ACTIVE', 'CLOSED')`,
		);
		await queryRunner.query(
			`CREATE TABLE "church" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "type" "public"."church_type_enum" NOT NULL, "phone" character varying, "email" character varying, "status" "public"."church_status_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "addressStreet" character varying NOT NULL, "addressNumber" character varying NOT NULL, "addressCity" character varying NOT NULL, "addressState" character varying NOT NULL, "addressComplement" character varying, "addressZip_code" character varying NOT NULL, CONSTRAINT "PK_b78b04d4dce07ba40672ef148ae" PRIMARY KEY ("id"))`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE "church"`);
		await queryRunner.query(`DROP TYPE "public"."church_status_enum"`);
		await queryRunner.query(`DROP TYPE "public"."church_type_enum"`);
	}
}
