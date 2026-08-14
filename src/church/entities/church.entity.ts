import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Address } from './address.embedded';

export enum ChurchType {
	HEADQUARTERS = 'HEADQUARTERS',
	CONGREGATION = 'CONGREGATION',
}

export enum ChurchStatus {
	ACTIVE = 'ACTIVE',
	CLOSED = 'CLOSED',
}

@Entity()
export class Church {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	name: string;

	@Column({
		type: 'enum',
		enum: ChurchType,
	})
	type: ChurchType;

	@Column(() => Address)
	address: Address;

	@Column({ type: 'varchar', nullable: true })
	phone: string | null;

	@Column({ type: 'varchar', nullable: true })
	email: string | null;

	@Column({
		type: 'enum',
		enum: ChurchStatus,
	})
	status: ChurchStatus;

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;
}
