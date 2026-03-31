import { BadRequestException, Injectable } from '@nestjs/common';
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
    const { identifier } = userLoginDto;

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

    const { user, hashedPassword } = await this.userService.findUserDynamic(
      {
        username: !isEmail ? identifier : undefined,
        email: isEmail ? identifier : undefined,
      },
      true,
      ['withRole', 'withPosition', 'withWorkSchedule', 'withDivision'],
    );

    // console.log('User found:', user);

    if (!bcrypt.compareSync(userLoginDto.password, hashedPassword!)) {
      throw new BadRequestException(
        isEmail
          ? 'Email or password is incorrect'
          : 'Username or password is incorrect',
      );
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
