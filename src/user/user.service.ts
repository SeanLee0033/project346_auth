import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { number } from '@hapi/joi';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  //Controller -> Service -> Controller

  //전체유저를 불러오는 로직
  // async getAllusers() {
  //   const users = await this.userRepository.find();
  //   return users;
  // }
  //유저 생성 로직
  async createUser(createUserDto: CreateUserDto) {
    const newUser = await this.userRepository.create(createUserDto);
    await this.userRepository.save(newUser);
    return newUser;
  }
  //id로 유저 찾는 로직
  async findUserById(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new HttpException('User not exists', HttpStatus.NOT_FOUND);
    }
    return user;
  }
  // email로 유저 찾는 로직
  async findUserByEmail(email: string) {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new HttpException('User not exists', HttpStatus.NOT_FOUND);
    }
    return user;
  }
}
