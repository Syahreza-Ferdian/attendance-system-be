import { Controller, Get } from '@nestjs/common';
import { RoleService } from './role.service';
import { ForAdmin } from 'src/authorization/authorization.decorator';
import { ResponseMessage } from 'src/common/response/response.decorator';

@Controller({
  path: 'roles',
  version: '1',
})
export class RoleController {
  constructor(private roleService: RoleService) {}

  @Get()
  @ForAdmin()
  @ResponseMessage('Successfully retrieved all roles')
  async getAllRoles() {
    return this.roleService.getAllRoles();
  }
}
