import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { UserEntity } from 'src/common/entity/user.entity';

export class UserLogin {
  // @ValidateIf((o: UserLogin) => !o.email)
  // @IsString()
  // @IsNotEmpty()
  // @Transform(({ value }: { value: string }) => value?.trim())
  // username?: string;

  // @ValidateIf((o: UserLogin) => !o.username)
  // @IsString()
  // @IsNotEmpty()
  // @Transform(({ value }: { value: string }) => value?.trim())
  // email?: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: { value: string }) => value?.trim())
  @ApiProperty({
    description: 'Username or email of the user',
  })
  identifier: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Password of the user',
  })
  password: string;
}

export class UserLoginResponse {
  user: UserEntity;
  accessToken: string;
}
