import {
  applyDecorators,
  CustomDecorator,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';

import { PermissionGuard } from '../guards/permissions.guard';

export const PERMISSION_KEY = 'hasPermission';
export const HasPermission = (permission: string): CustomDecorator<string> =>
  SetMetadata(PERMISSION_KEY, permission);

export function Permission(permission: string) {
  return applyDecorators(HasPermission(permission), UseGuards(PermissionGuard));
}
