import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './tokenPayload.interface';
import { EmailService } from '../email/email.service';
import { VerificationTokenPayload } from './VerificationTokenPayload.interface';
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  public async registerUser(createUserDto: CreateUserDto) {
    // const newUser = await this.userService.createUser(createUserDto);
    // return newUser;

    // 패스워드 암호화
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    try {
      const createdUser = await this.userService.createUser({
        ...createUserDto,
        password: hashedPassword,
      });
      createdUser.password = undefined;
      return createdUser;
    } catch (err) {
      throw new HttpException(
        'User with that email already exists',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  // 이메일 유무 -> 패스워드 매칭 -> 리턴 유저정보
  public async getAuthenticatedUser(email: string, hashedPassword: string) {
    try {
      const user = await this.userService.findUserByEmail(email);
      // 패스워드 매칭
      await this.verifyPassword(hashedPassword, user.password);
      // const isPasswordMatching = await bcrypt.compare(
      //   hashedPassword,
      //   user.password,
      // );
      //
      // if (!isPasswordMatching) {
      //   throw new HttpException(
      //     'Password is not matched',
      //     HttpStatus.BAD_REQUEST,
      //   );
      // }
      user.password = undefined;
      return user;
    } catch (err) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // 패스워드 비교 함수
  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    );
    if (!isPasswordMatching) {
      throw new HttpException(
        'Password was not matched',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public getJwtToken(userId: number) {
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload);
    return token;
  }

  public async sendEmailTest() {
    return await this.emailService.sendMail({
      // to: email,
      to: 'qww0033@gmail.com',
      subject: 'project 346 test mail',
      text: 'Welcome to project346',
    });
  }

  public sendVerificationLink(email: string) {
    const payload: VerificationTokenPayload = { email };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_VERIFICATION_TOKEN_EXPIRATION_TIME',
      )}s`,
    });

    const url = `${this.configService.get(
      'EMAIL_CONFIRMATION_URL',
    )}?token=${token}`;
    const text = `Welcome to the application. To confirm the email address, click here: ${url}`;

    return this.emailService.sendMail({
      to: email,
      subject: 'Sign up Email confirmation',
      text,
    });
  }

  public async confirmEmail(email: string) {
    const user = await this.userService.findUserByEmail(email);
    if (user.isEmailConfirmed) {
      throw new BadRequestException('Email already confirmed');
    }
    await this.userService.markEmailAsConfirmed(email);
  }
  public async decodeConfirmationToken(token: string) {
    try {
      const payload = await this.jwtService.verify(token, {
        secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
      });
      if (typeof payload === 'object' && 'email' in payload) {
        return payload.email;
      }
      throw new BadRequestException();
    } catch (err) {
      if (err?.name === 'TokenExpiredError') {
        throw new BadRequestException('Email confirmation token expired');
      }
      throw new BadRequestException('Bad confirmation token');
    }
  }

  public async resendConfirmationLink(userId: number) {
    const user = await this.userService.findUserById(userId);
    if (user.isEmailConfirmed) {
      throw new BadRequestException('Email already confirmed');
    }
    await this.sendVerificationLink(user.email);
  }
}
