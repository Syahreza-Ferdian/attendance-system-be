import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { Public } from './authentication.decorator';
import { ResponseMessage } from 'src/common/response/response.decorator';
import { UserLogin, UserLoginResponse } from './dto/login.dto';
import { NoFilesInterceptor } from '@nestjs/platform-express';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthenticationController {
  constructor(private authenticationService: AuthenticationService) {}

  @Post('login')
  @Public()
  @UseInterceptors(NoFilesInterceptor())
  @ResponseMessage('Successfully logged in')
  async login(@Body() loginDto: UserLogin): Promise<UserLoginResponse> {
    return await this.authenticationService.login(loginDto);
  }
}
