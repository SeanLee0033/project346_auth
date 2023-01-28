import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { LocalAuthGuard } from './localAuth.guard';
import { RequestWithUser } from './requestWithUser.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async createUser(@Body() createUserDto: CreateUserDto) {
    const newUser = await this.authService.registerUser(createUserDto);
    return newUser;
  }

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async authedUser(@Req() request: RequestWithUser) {
    const user = request.user;
    return user;
  }
}
