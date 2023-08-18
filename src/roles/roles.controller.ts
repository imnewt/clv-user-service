import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateRoleDto } from './dtos/create-role.dto';
import { UpdateRoleDto } from './dtos/update-role.dto';

import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly roleService: RolesService) {}

  @Get()
  getRoles(@Query() query) {
    const { search: searchTerm } = query;
    return this.roleService.getRoles(searchTerm);
  }

  @Get(':id')
  async getRoleById(@Param('id') roleId: string) {
    return this.roleService.getRoleById(roleId);
  }

  @Post('/create')
  createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.createRole(createRoleDto);
  }

  @Patch(':id')
  updateRole(
    @Param('id') roleId: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.roleService.updateRole(roleId, updateRoleDto);
  }

  @Delete(':id')
  deleteRole(@Param('id') roleId: string) {
    return this.roleService.deleteRole(roleId);
  }
}
