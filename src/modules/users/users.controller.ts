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
import { Permission } from 'src/decorators/permission.decorator';
import { PERMISSION } from 'src/utils/constants';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Permission(PERMISSION.READ_USER)
  @Get()
  getAllUsers(@Query() query) {
    const { searchTerm, pageNumber, pageSize } = query;
    return this.userService.getAllUsers({
      searchTerm,
      pageNumber,
      pageSize,
    });
  }

  @UseInterceptors(ClassSerializerInterceptor)
  // @UseFilters(HttpExceptionFilter)
  @Permission(PERMISSION.READ_USER)
  @Get(':id')
  async getUserById(@Param('id') userId: string) {
    const data = this.userService.getUserById(userId);
    const user = await data;
    if (user) {
      return new SerializedUser(user);
    } else {
      throw new UserNotFoundException();
    }
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Permission(PERMISSION.READ_USER)
  @Get(':id/permissions')
  getUserPermissions(@Param('id') userId: string) {
    return this.userService.getUserPermissions(userId);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Permission(PERMISSION.CREATE_USER)
  @Post('/create')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Permission(PERMISSION.UPDATE_USER)
  @Patch(':id')
  updateUser(
    @Param('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(userId, updateUserDto);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Permission(PERMISSION.DELETE_USER)
  @Delete(':id')
  deleteUser(@Param('id') userId: string) {
    return this.userService.deleteUser(userId);
  }
}