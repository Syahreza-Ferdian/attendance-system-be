import { IsEmail, IsNotEmpty, ValidateIf } from 'class-validator';

export class GetUserByEmailOrUsernameDto {
  @ValidateIf((o: GetUserByEmailOrUsernameDto) => !o.username)
  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @ValidateIf((o: GetUserByEmailOrUsernameDto) => !o.email)
  @IsNotEmpty()
  username?: string;
}
