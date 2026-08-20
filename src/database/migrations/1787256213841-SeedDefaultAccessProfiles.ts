import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDefaultAccessProfiles1787256213841 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			INSERT INTO	access_profile (name, permissions) VALUES (
				'OWNER', '{
					"CHURCHES": { "permission": "FULL",	"scope": "GLOBAL" },
					"MEMBERS": { "permission": "FULL", "scope": "GLOBAL" },
					"USERS": { "permission": "FULL", "scope": "GLOBAL" },
					"ACCESS_PROFILES": { "permission": "FULL", "scope": "GLOBAL" },
					"PASTORAL_LEADERSHIP": { "permission": "FULL", "scope": "GLOBAL"	},
					"AUDIT": { "permission": "FULL",	"scope": "GLOBAL" }
				}'::jsonb
			), (
			'ADMIN', '{
					"CHURCHES": { "permission": "FULL",	"scope": "GLOBAL" },
					"MEMBERS": { "permission": "FULL", "scope": "GLOBAL" },
					"USERS": { "permission": "FULL", "scope": "GLOBAL" },
					"ACCESS_PROFILES": { "permission": "READ", "scope": "GLOBAL" },
					"PASTORAL_LEADERSHIP": { "permission": "FULL", "scope": "GLOBAL"	},
					"AUDIT": { "permission": "NONE",	"scope": "GLOBAL" }
				}'::jsonb
			), (
			'SHEPHERD', '{
					"CHURCHES": { "permission": "FULL",	"scope": "OWN_CHURCH" },
					"MEMBERS": { "permission": "FULL", "scope": "OWN_CHURCH" },
					"USERS": { "permission": "FULL", "scope": "OWN_CHURCH" },
					"ACCESS_PROFILES": { "permission": "READ", "scope": "GLOBAL" },
					"PASTORAL_LEADERSHIP": { "permission": "NONE", "scope": "GLOBAL"	},
					"AUDIT": { "permission": "NONE",	"scope": "GLOBAL" }
				}'::jsonb
			), (
			'SECRETARY', '{
					"CHURCHES": { "permission": "READ",	"scope": "OWN_CHURCH" },
					"MEMBERS": { "permission": "FULL", "scope": "OWN_CHURCH" },
					"USERS": { "permission": "NONE", "scope": "OWN_CHURCH" },
					"ACCESS_PROFILES": { "permission": "NONE", "scope": "GLOBAL" },
					"PASTORAL_LEADERSHIP": { "permission": "NONE", "scope": "GLOBAL"	},
					"AUDIT": { "permission": "NONE",	"scope": "GLOBAL" }
				}'::jsonb
			)
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			DELETE FROM access_profile WHERE name in ('OWNER','ADMIN','SHEPHERD', 'SECRETARY);	
		`);
	}
}
