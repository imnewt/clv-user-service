import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  // UseFilters,
  UseInterceptors,
} from '@nestjs/common';

import { UserNotFoundException } from './exceptions/UserNotFound.exception';
// import { HttpExceptionFilter } from './filters/httpException.filter';
import { SerializedUser } from './types/user';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { CreateUserDto } from './dtos/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  getAllUsers(@Query() query) {
    const { search: searchTerm } = query;
    return this.userService.getAllUsers(searchTerm);
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

  @Post('/create')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Patch(':id')
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  deleteUser(@Param('id') userId: string) {
    return this.userService.deleteUser(userId);
  }
}
