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
} from '@nestjs/common';

import { CreateRoleDto, UpdateRoleDto } from '@domain/dtos';
import { IRoleService } from '@domain/interfaces/services';
import { Permission } from '@domain/decorators/permission.decorator';
import { PERMISSION } from '@domain/utilities/constants';

@Controller('roles')
export class RoleController {
  constructor(
    @Inject(IRoleService) private readonly roleService: IRoleService,
  ) {}

  @Permission(PERMISSION.READ_ROLE)
  @Get()
  getRoles(
    @Query()
    query: {
      searchTerm: string;
      pageNumber: number;
      pageSize: number;
    },
  ) {
    const { searchTerm, pageNumber, pageSize } = query;
    return this.roleService.getRoles({
      searchTerm,
      pageNumber,
      pageSize,
    });
  }

  @Permission(PERMISSION.READ_ROLE)
  @Get(':id')
  getRoleById(@Param('id') roleId: string) {
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
