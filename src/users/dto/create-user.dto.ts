export class CreateUserDto {
	name: string;
	email: string;
	password: string;
	access_profile_id: string;
	church_id?: string;
	member_id?: string;
}
