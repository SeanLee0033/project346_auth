import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/signup')
  async createUser(@Body() createUserDto: CreateUserDto) {
    const newUser = await this.userService.createUser(createUserDto);
    return newUser;
  }

  // @Get('/:id')
  // async findUserById(@Param('id') id: number) {
  //   const user = await this.userService.findUserById(id);
  //   return user;
  // }

  // @Get()
  // async getAllUsers() {
  //   return await this.userService.getAllusers();
  // }
  @Get('/email')
  async findUserByEmail(@Body('email') email: string) {
    const user = await this.userService.findUserByEmail(email);
    return user;
  }
}
