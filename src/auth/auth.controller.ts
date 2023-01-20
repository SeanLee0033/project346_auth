import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginUserDto } from '../user/dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async createUser(@Body() createUserDto: CreateUserDto) {
    const newUser = await this.authService.registerUser(createUserDto);
    return newUser;
  }

  @Post('/login')
  async authedUser(@Body() loginUserDto: LoginUserDto) {
    const loggedUser = await this.authService.getAuthenticatedUser(
      loginUserDto.email,
      loginUserDto.password,
    );
    return loggedUser;
  }
}
