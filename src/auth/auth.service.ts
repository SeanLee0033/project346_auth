import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

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
      await this.verifyPassword(hashedPassword, user.password)
      // const isPasswordMatching = await bcrypt.compare(
      //   hashedPassword,
      //   user.password,
      // );
      //
      // if (!isPasswordMatching) {
      //   throw new HttpException(
      //     'Password does not matched',
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
}
