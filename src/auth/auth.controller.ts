import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('login')
	@Public()
	login(@Body() loginDto: LoginDto) {
		return this.authService.authenticate(loginDto);
	}

	@Post('refresh')
	@Public()
	refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
		return this.authService.refreshTokens(refreshTokenDto.refreshToken);
	}
}
