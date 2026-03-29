import { Module } from '@nestjs/common';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';

dotenv.config();

const JWT_EXPIRATION = process.env.JWT_EXPIRED
  ? parseInt(process.env.JWT_EXPIRED, 10)
  : undefined;

@Module({
  controllers: [AuthenticationController],
  providers: [AuthenticationService],
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: JWT_EXPIRATION },
    }),
  ],
})
export class AuthenticationModule {}
