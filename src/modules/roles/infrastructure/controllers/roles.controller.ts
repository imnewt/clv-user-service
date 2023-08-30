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

import { RolesService } from '@roles/services/roles.service';
import { CreateRoleDto } from '@roles/dtos/create-role.dto';
import { UpdateRoleDto } from '@roles/dtos/update-role.dto';
import { Permission } from '@shared/decorators/permission.decorator';
import { PERMISSION } from '@shared/utilities/constants';

@Controller('roles')
export class RolesController {
  constructor(private readonly roleService: RolesService) {}

  @Permission(PERMISSION.READ_ROLE)
  @Get()
  getRoles(@Query() query) {
    const { searchTerm, pageNumber, pageSize } = query;
    return this.roleService.getRoles({ searchTerm, pageNumber, pageSize });
  }

  @Permission(PERMISSION.READ_ROLE)
  @Get(':id')
  async getRoleById(@Param('id') roleId: string) {
    return this.roleService.getRoleById(roleId);
  }

  @Permission(PERMISSION.CREATE_ROLE)
  @Post('/create')
  createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.createRole(createRoleDto);
  }

  @Permission(PERMISSION.UPDATE_ROLE)
  @Patch(':id')
  updateRole(
    @Param('id') roleId: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.roleService.updateRole(roleId, updateRoleDto);
  }

  @Permission(PERMISSION.DELETE_ROLE)
  @Delete(':id')
  deleteRole(@Param('id') roleId: string) {
    return this.roleService.deleteRole(roleId);
  }
}
