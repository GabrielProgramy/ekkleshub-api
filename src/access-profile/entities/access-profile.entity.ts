import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

type ModulePermission = {
	permission: PermissionLevel;
	scope: PermissionScope;
};

export enum PermissionModule {
	CHURCHES = 'CHURCHES',
	MEMBERS = 'MEMBERS',
	USERS = 'USERS',
	ACCESS_PROFILES = 'ACCESS_PROFILES',
	PASTORAL_LEADERSHIP = 'PASTORAL_LEADERSHIP',
	AUDIT = 'AUDIT',
}

export enum PermissionLevel {
	FULL = 'FULL',
	READ = 'READ',
	NONE = 'NONE',
}

export enum PermissionScope {
	GLOBAL = 'GLOBAL',
	OWN_CHURCH = 'OWN_CHURCH',
}

type Permission = Record<PermissionModule, ModulePermission>;

@Entity()
export class AccessProfile {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ unique: true })
	name: string;

	@Column({ type: 'jsonb' })
	permissions: Permission;

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;
}
