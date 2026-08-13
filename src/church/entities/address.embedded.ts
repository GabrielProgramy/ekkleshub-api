import { Column } from 'typeorm';

export class Address {
	@Column()
	street: string;
	@Column()
	number: string;
	@Column()
	city: string;
	@Column()
	state: string;
	@Column({ type: 'varchar', nullable: true })
	complement?: string | null;
	@Column()
	zip_code: string;
}
