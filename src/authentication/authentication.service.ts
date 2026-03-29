import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { UserLogin, UserLoginResponse } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthenticationService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(userLoginDto: UserLogin): Promise<UserLoginResponse> {
    const { user, hashedPassword: password } =
      await this.userService.findUserDynamic(
        {
          username: userLoginDto.username ?? undefined,
          email: userLoginDto.email ?? undefined,
        },
        true,
      );

    // console.log('User found:', user);

    if (!bcrypt.compareSync(userLoginDto.password, password!)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    return {
      user: user,
      accessToken: await this.jwtService.signAsync(payload),
    };
  }
}
