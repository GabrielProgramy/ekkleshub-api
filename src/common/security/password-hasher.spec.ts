import { PasswordHasher } from './password-hasher';

describe('PasswordHasher', () => {
	it('deve retornar true quando a senha corresponde ao hash', async () => {
		const passwordHasher = new PasswordHasher();
		const passwordHash = await passwordHasher.hash('senha-segura');

		await expect(
			passwordHasher.compare('senha-segura', passwordHash),
		).resolves.toBe(true);
	});

	it('deve retornar false quando a senha não corresponde ao hash', async () => {
		const passwordHasher = new PasswordHasher();
		const passwordHash = await passwordHasher.hash('senha-segura');

		await expect(
			passwordHasher.compare('senha-incorreta', passwordHash),
		).resolves.toBe(false);
	});
});
