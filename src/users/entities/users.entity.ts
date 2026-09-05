import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Users {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	name: string;

	@Column()
	email: string;

	@Column({ select: false })
	password?: string;

	@Column()
	status: string;

	@Column()
	access_profile_id: string;

	@Column()
	church_id?: string;

	@Column()
	member_id?: string;

	@Column()
	last_access_at?: Date;

	@CreateDateColumn()
	createdAt?: Date;

	@UpdateDateColumn()
	updatedAt?: Date;
}
