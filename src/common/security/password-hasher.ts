import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordHasher {
	private readonly saltRounds = 10;

	hash(password: string): Promise<string> {
		return bcrypt.hash(password, this.saltRounds);
	}
}
