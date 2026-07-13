import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Get,
  // UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { AuthDto } from './dto/auth.dto';
import { GetUser, GetUserAdmin } from './decorator';
import { TokenDto } from './dto/token.dto';
import { LogOutDto } from './dto/logOut.dto';
import { LoginDto } from './dto/login.dto';
import { JwtGuard } from './guard';
import { CreateUserDto } from '../user/dto';
import { User } from '../user/entities/user.entity';
import { AuthResponseDto } from './dto/auth-response.dto';
// import { GetUserAdmin } from './decorator';
// import { JwtGuard } from './guard';
// import { User } from '../user/entities/user.entity';

@ApiTags('Authentication')
@Controller('autenticacion')
export class AuthController {
  constructor(private authSetvice: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('signup')
  signup(@Body() dto: CreateUserDto) {
    return this.authSetvice.signup(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signup-admin')
  signupAdmin(@Body() dto: CreateUserDto) {
    return this.authSetvice.signupAdmin(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Autentica el usuario' })
  signin(@Body() dto: AuthDto) {
    return this.authSetvice.login(dto);
  }

  
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('log-out')
  @ApiOperation({ summary: 'Cierra sesión' })
  signOut(@GetUser() user: User) {
    const dto = new LoginDto
    dto.username = user.username
    return this.authSetvice.logOut(dto);
  }


  @HttpCode(HttpStatus.OK)
  @Post('is-token-expired')
  @ApiOperation({ summary: 'Valida el token' })
  isTokenExpired(@Body() dto: TokenDto) {
    return this.authSetvice.isTokenExpired(dto);
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logged-out')
  @ApiOperation({ summary: 'Cierra sesión' })
  loggedAdmin(
  @Body() dto: LogOutDto,
  @GetUserAdmin() user: User) {
    return this.authSetvice.loggedOut(dto);
  }

}
