import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  // UseFilters,
  UseInterceptors,
} from '@nestjs/common';

import { UserNotFoundException } from './exceptions/UserNotFound.exception';
// import { HttpExceptionFilter } from './filters/httpException.filter';
import { SerializedUser } from './types/user';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  getUsers() {
    return this.userService.getUsers();
  }

  @UseInterceptors(ClassSerializerInterceptor)
  // @UseFilters(HttpExceptionFilter)
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const data = this.userService.getUserById(id);
    const user = await data;
    if (user) {
      return new SerializedUser(user);
    } else {
      throw new UserNotFoundException();
    }
  }
}
