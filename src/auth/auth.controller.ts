import {
  Body,
  Controller,
  Get,
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
import { JwtAuthGuard } from './jwtAuth.guard';
import { ConfirmEmailDto } from '../user/dto/confirm-email.dto';
import { User } from '../user/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async createUser(@Body() createUserDto: CreateUserDto) {
    const newUser = await this.authService.registerUser(createUserDto);
    await this.authService.sendVerificationLink(createUserDto.email);
    return newUser;
  }

  @Post('/confirm')
  async confirmEmail(@Body() confirmationData: ConfirmEmailDto) {
    const email = await this.authService.decodeConfirmationToken(
      confirmationData.token,
    );
    await this.authService.confirmEmail(email);
  }

  @Post('/email')
  async testEmail() {
    return await this.authService.sendEmailTest();
  }

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async authedUser(@Req() request: RequestWithUser) {
    const { user } = request;
    const token = this.authService.getJwtToken(user.id);
    return token;
    // const user = request.user; => 유저정보 (id, email, username)
    // return user;
  }

  @Post('resend/confirm')
  @UseGuards(JwtAuthGuard)
  async resendConfirmationLink(@Req() req: RequestWithUser) {
    await this.authService.resendConfirmationLink(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  authenticate(@Req() request: RequestWithUser) {
    const { user } = request;
    return user;
  }
}
