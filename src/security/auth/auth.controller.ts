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
import { ReturnDto } from 'src/common/base/dto';
import { CodeEnum } from 'src/common/enum/code.enum';
import { MessageCodes } from 'src/common/enum/messageCodes.enum';
import { KindTokenEnum } from 'src/common/enum/kind.token.enum';


@ApiTags('Authentication')
@Controller('autenticacion')
export class AuthController {
  private returnDto: ReturnDto;

  constructor(private authService: AuthService) {
      this.returnDto = new ReturnDto();
  }

  @HttpCode(HttpStatus.OK)
  @Post('signup')
  signup(@Body() dto: CreateUserDto) {
    return this.authService.signup(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signup-admin')
  signupAdmin(@Body() dto: CreateUserDto) {
    return this.authService.signupAdmin(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  @ApiOperation({ summary: 'Autentica el usuario' })
  signin(@Body() dto: AuthDto) {
    return this.authService.login(dto);
  }

  
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('log-out')
  @ApiOperation({ summary: 'Cierra sesión' })
  signOut(@GetUser() user: User) {
    const dto = new LoginDto
    dto.username = user.username
    return this.authService.logOut(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('is-token-expired')
  @ApiOperation({ summary: 'Valida el token' })
  isTokenExpired(@Body() dto: TokenDto) {
    return this.authService.isTokenExpired(dto);
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logged-out')
  @ApiOperation({ summary: 'Cierra sesión' })
  loggedAdmin(
  @Body() dto: LogOutDto,
  @GetUserAdmin() user: User) {
    return this.authService.loggedOut(dto);
  }

  @UseGuards(JwtGuard)
  @Post('refresh')
  async refresh(@Body() body: { refresh_token: string },
  @GetUser()user: User
  ):Promise<ReturnDto> {
    const { refresh_token } = body;
    const result = this.authService.verifyRefreshToken(refresh_token);

    if (result.valid) {
      const { iat, exp, ...decodedWithoutIatExp } = result.decoded; // Eliminar iat y exp      
      const newAccessToken = this.authService.generateAccessToken(decodedWithoutIatExp);
      this.returnDto.isSuccess = true;
      this.returnDto.requestCode = CodeEnum.OK;
      this.returnDto.returnMessageCode = MessageCodes.SUCCESS;
      this.returnDto.data = {
        access_token: newAccessToken,
      };
    } else if (result.expired) {
      this.returnDto.isSuccess = false;
      this.returnDto.requestCode = CodeEnum.UNAUTHORIZED;
      this.returnDto.returnMessageCode = MessageCodes.EXPIRED;
    } else {
      this.returnDto.isSuccess = false;
      this.returnDto.requestCode = CodeEnum.UNAUTHORIZED;
      this.returnDto.returnMessageCode = MessageCodes.INVALID_TOKEN_REFRESH;

    }
    return this.returnDto;
  }

  @Post('verify-access-token')
  async verifyAccess(@Body() body: { access_token: string; refresh_token: string }):Promise<ReturnDto> {
    this.returnDto.data = [];
    const { access_token, refresh_token } = body;

    // Primero verificamos el token de refresh
    const refreshResult = this.authService.verifyRefreshToken(refresh_token);

    if (!refreshResult.valid) {
      if (refreshResult.expired) {
        this.returnDto.isSuccess = false;
        this.returnDto.requestCode = CodeEnum.UNAUTHORIZED;
        this.returnDto.returnMessageCode = MessageCodes.REFRESH_EXPIRED;
      } else {
        this.returnDto.isSuccess = false;
        this.returnDto.requestCode = CodeEnum.UNAUTHORIZED;
        this.returnDto.returnMessageCode = MessageCodes.INVALID_TOKEN_REFRESH;
      }
      return this.returnDto;
    }

    // Si el refresh token es válido, verificamos el access token
    const accessResult = this.authService.verifyAccessToken(access_token);

    if (accessResult.valid) {
      this.returnDto.isSuccess = true;
      this.returnDto.requestCode = CodeEnum.OK;
      this.returnDto.returnMessageCode = MessageCodes.SUCCESS;
    } else if (accessResult.expired) {
      this.returnDto.isSuccess = false;
      this.returnDto.requestCode = CodeEnum.UNAUTHORIZED;
      this.returnDto.returnMessageCode = MessageCodes.ACCESS_EXPIRED; 
      return this.returnDto;
    } else {
      this.returnDto.isSuccess = false;
      this.returnDto.requestCode = CodeEnum.UNAUTHORIZED;
      this.returnDto.returnMessageCode = MessageCodes.INVALID_TOKEN_ACCESS;
      return this.returnDto;
    }
    return this.returnDto;

  }

  @Post('verify-refresh')
  async verifyRefresh(@Body() body: { refresh_token: string }):Promise<ReturnDto> {
    const result = this.authService.verifyRefreshToken(body.refresh_token);

    if (result.valid) {
      this.returnDto.isSuccess = true;
      this.returnDto.requestCode = CodeEnum.OK;
      this.returnDto.returnMessageCode = MessageCodes.SUCCESS;
      this.returnDto.data = [];

    } else if (result.expired) {
      this.returnDto.isSuccess = false;
      this.returnDto.requestCode = CodeEnum.UNAUTHORIZED;
      this.returnDto.returnMessageCode = MessageCodes.EXPIRED;

    } else {
      this.returnDto.isSuccess = false;
      this.returnDto.requestCode = CodeEnum.UNAUTHORIZED;
      this.returnDto.returnMessageCode = MessageCodes.UNAUTHORIZED;
    }
    return this.returnDto;
  }

  @Post('payload')
  async payload(@Body() body: { access_token: string }):Promise<ReturnDto> {
    const result = this.authService.verifyAccessToken(body.access_token);

    if (result.valid) {
      this.returnDto.isSuccess = true;
      this.returnDto.requestCode = CodeEnum.OK;
      this.returnDto.returnMessageCode = MessageCodes.SUCCESS;
      this.returnDto.data = result.decoded;

    } else if (result.expired) {
      this.returnDto.isSuccess = false;
      this.returnDto.requestCode = CodeEnum.UNAUTHORIZED;
      this.returnDto.returnMessageCode = MessageCodes.EXPIRED;

    } else {
      this.returnDto.isSuccess = false;
      this.returnDto.requestCode = CodeEnum.UNAUTHORIZED;
      this.returnDto.returnMessageCode = MessageCodes.UNAUTHORIZED;

    }
    return this.returnDto;
  }
}
