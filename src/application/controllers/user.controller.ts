import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Inject,
  Query,
  Patch,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';

import { CreateUserDto, UpdateUserDto } from '@domain/dtos';
import { IUserService } from '@domain/use-cases/user';
import { Permission } from '@domain/decorators/permission.decorator';
import { PERMISSION } from '@domain/utilities/constants';

@Controller('users')
export class UserController {
  constructor(
    @Inject(IUserService) private readonly userService: IUserService,
  ) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Permission(PERMISSION.READ_USER)
  @Get()
  getUsers(
    @Query()
    query: {
      searchTerm: string;
      pageNumber: number;
      pageSize: number;
    },
  ) {
    const { searchTerm, pageNumber, pageSize } = query;
    return this.userService.getUsers({
      searchTerm,
      pageNumber,
      pageSize,
    });
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Permission(PERMISSION.READ_USER)
  @Get(':id')
  getUserById(@Param('id') userId: string) {
    return this.userService.getUserById(userId);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Permission(PERMISSION.READ_USER)
  @Get(':id/permissions')
  getUserPermissions(@Param('id') userId: string) {
    return this.userService.getUserPermissions(userId);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Permission(PERMISSION.CREATE_USER)
  @Post()
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

  @Permission(PERMISSION.DELETE_USER)
  @Delete(':id')
  deleteUser(@Param('id') userId: string) {
    return this.userService.deleteUser(userId);
  }
}
