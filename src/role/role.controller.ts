import { Controller, Get } from '@nestjs/common';
import { RoleService } from './role.service';
import { ForAdmin } from 'src/authorization/authorization.decorator';
import { ResponseMessage } from 'src/common/response/response.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller({
  path: 'roles',
  version: '1',
})
@ApiBearerAuth()
@ApiTags('Roles')
export class RoleController {
  constructor(private roleService: RoleService) {}

  @Get()
  @ForAdmin()
  @ResponseMessage('Successfully retrieved all roles')
  @ApiOperation({
    summary: 'Get all roles',
  })
  @ApiResponse({
    status: 200,
    description: 'List of roles',
  })
  async getAllRoles() {
    return this.roleService.getAllRoles();
  }
}
