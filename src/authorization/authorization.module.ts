import { Module } from '@nestjs/common';

@Module({})
export class AuthorizationModule {}

// import { Module } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { UsersModule } from 'src/users/users.module';

// @Module({
//   imports: [UsersModule],
//   providers: [AuthorizationModule, Reflector],
// })
// export class AuthorizationModule {}
