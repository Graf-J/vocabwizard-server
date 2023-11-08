import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  login(@Body() loginUserDto: LoginUserDto) {
    return 'Login';
  }

  @Post('/register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    const user =  await this.authService.register(registerUserDto);
    const jwt = await this.authService.generateJWT(user.id, user.role)

    return { 'AccessToken': jwt }
  }
}
