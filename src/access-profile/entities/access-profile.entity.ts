import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

type ModulePermission = {
	permission: 'FULL' | 'READ' | 'NONE';
	scope: 'GLOBAL' | 'OWN_CHURCH';
};

type Permission = {
	CHURCHES: ModulePermission;
	MEMBERS: ModulePermission;
	USERS: ModulePermission;
	ACCESS_PROFILES: ModulePermission;
	PASTORAL_LEADERSHIP: ModulePermission;
	AUDIT: ModulePermission;
};

@Entity()
export class AccessProfile {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	name: string;

	@Column({ type: 'jsonb' })
	permission: Permission;

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;
}
