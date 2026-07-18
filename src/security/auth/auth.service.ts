import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../user/entities/user.entity';
import { TokenDto } from './dto/token.dto';
import { LogOutDto } from './dto/logOut.dto';
import { LoginDto } from './dto/login.dto';
import { Rol } from '../rol/entities/rol.entity';
import { CreateUserDto } from '../user/dto';
import { KindTokenEnum } from 'src/common/enum/kind.token.enum';
import { CodeEnum } from 'src/common/enum/code.enum';
import { MessageCodes } from 'src/common/enum/messageCodes.enum';
import { returnClass } from 'src/common/base/class/returned.class';
import { Blocked } from '../blocked/entities/blocked.entity';
import { AccessTypeEnum } from 'src/common/enum/access.type.enum';
import { ResourceEnum } from 'src/common/enum/resource.enum';


@Injectable({})
export class AuthService  extends returnClass{
  private readonly logger = new Logger(AuthService.name);
  private readonly SUPER_ADMIN_NAME = 'Super Admin';

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Rol)
    private roleRepository: Repository<Rol>,

    @InjectRepository(Blocked)
    private blockRepository: Repository<Blocked>,

    private jwt: JwtService,
    private config: ConfigService,
    private readonly jwtService: JwtService) 
  {
    super();
  }

  // Revisado

  async login(dto: LoginDto) {
    // find the user by username
    const user = await this.userRepository.findOne({
      where: { username: dto.username },
    });

    if (!user) {
      return this.getReturn(false, CodeEnum.FORBIDDEN, null, CodeEnum.FORBIDDEN, 'User Name do not exist', MessageCodes.NOT_FOUND, CodeEnum.FORBIDDEN);
    }
    // ask if user is blocked
    const userBlock = this.blockRepository.findOne({
      where:{
        identifier: user.id,
        accessType: AccessTypeEnum.USERNAME
      }
    })
    if(userBlock){
      return this.getReturn(false, CodeEnum.BLOCKED, null, CodeEnum.BLOCKED, ResourceEnum.BLOCKED, MessageCodes.BLOCKED, CodeEnum.FORBIDDEN);
    }
    // otherwise continue
    // compare password
    const pwMatch = await argon.verify(user.hash, dto.password);
    // if password incorrect return an exception
    if (!pwMatch) {
      return this.getReturn(false, CodeEnum.FORBIDDEN, null, CodeEnum.FORBIDDEN, ResourceEnum.PASSWORD_INCORRECT, MessageCodes.NOT_FOUND, CodeEnum.FORBIDDEN);
    }
    // otherwise continue
    // check if user is already logged
    const role = await this.roleRepository.findOne({
      where: { id: '4252bf9a-b5f9-4c62-b146-e8977b79431e' },
    });

    if (user.role.id == role.id) { 
      user.isLogged = false;
    }
    if (user.isLogged) {
      return this.getReturn(false, CodeEnum.FORBIDDEN, null, CodeEnum.FORBIDDEN, ResourceEnum.USER_AREADY_LOGGED, MessageCodes.NOT_FOUND, CodeEnum.FORBIDDEN);
    }

    if (user.role.id != role.id) {
      user.isLogged = true;
    }

    await this.userRepository.save(user);
    // return the save user token

        const accessInfo ={
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role.id
        }
        const accessPayload = {
          tokenKind: KindTokenEnum.ACCESS_TOKEN,
          userID: user.id,
        };
        const refreshPayload = {
          tokenKind: KindTokenEnum.REFRESH_TOKEN,
          userID: user.id,
        };

        const accessToken = this.generateAccessToken(accessPayload);
    const refreshToken = this.generateRefreshToken(refreshPayload);
    const data = {
      accessInfo: accessInfo,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
    return this.getReturn(true, CodeEnum.OK, data, CodeEnum.OK, ResourceEnum.SUCCESS, MessageCodes.SUCCESS, CodeEnum.OK);
  }

  // Revisado
  async logOut(dto: LoginDto) {
    // find the user by username
    const user = await this.userRepository.findOneBy({
      username: dto.username,
    });

    if (!user) {
      return this.getReturn(false, CodeEnum.FORBIDDEN, null, CodeEnum.FORBIDDEN, ResourceEnum.USER_DOES_NOT_EXIST, MessageCodes.NOT_FOUND, CodeEnum.FORBIDDEN);
    }
    // otherwise continue
    // poner  is logged false
    user.isLogged = false;
    await this.userRepository.save(user);

    // Aca mezclo
    const data = {
      accessInfo: null,
      access_token: null,
      refresh_token: null,
    };
    return this.getReturn(true, CodeEnum.OK, data, CodeEnum.OK, ResourceEnum.SUCCESS, MessageCodes.SUCCESS, CodeEnum.OK);
  }

  async signupAdmin(dto: CreateUserDto) {
    // to register only the first admin
    //generate the password hash
    const hash = await argon.hash(dto.password);

    // get the Admin Role
    // TODO
    const role = await this.roleRepository.findOne({
      where: {
        id: '4252bf9a-b5f9-4c62-b146-e8977b79431e',
      },
    });
    // search for another user with the same username
    let userExist = await this.userRepository.findOneBy({
      username: dto.username,
    });
    if (userExist) {
      return this.getReturn(false, CodeEnum.FORBIDDEN, null, CodeEnum.FORBIDDEN, `The user Name ${dto.username} is taken.`, MessageCodes.NOT_FOUND, CodeEnum.FORBIDDEN);
    }
    // search if exist any admin
    // TODO
    if (role) {
      userExist = await this.userRepository.findOneBy({
        role: role,
      });
      if (userExist) {
      return this.getReturn(false, CodeEnum.FORBIDDEN, null, CodeEnum.FORBIDDEN, ResourceEnum.FIRST_ADMIN_EXIST, MessageCodes.NOT_FOUND, CodeEnum.FORBIDDEN);
      }
    }

    // otherwise continue
    //save the user in the BD
    let user = this.userRepository.create({
      username: dto.username,
      email: dto.username,
      hash: hash,
      role: role,
      name: dto.name,
      // phone: dto.phone,
      isLogged: false,
      isActive: true,
      // lastname: dto.lastname,
    });
    user = await this.userRepository.save(user);
    // return the save user token
    const accessInfo ={
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role.id
        }
        const accessPayload = {
          tokenKind: KindTokenEnum.ACCESS_TOKEN,
          userID: user.id,
          // req.customData, // Permite datos personalizados en el payload
        };
        const refreshPayload = {
          tokenKind: KindTokenEnum.REFRESH_TOKEN,
          userID: user.id,
          // req.customData, // Permite datos personalizados en el payload
        };
    // Aca mezclo

    const accessToken = this.generateAccessToken(accessPayload);
    const refreshToken = this.generateRefreshToken(refreshPayload);
    const data = {
      accessInfo: accessInfo,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
    return this.getReturn(true, CodeEnum.OK, data, CodeEnum.OK, 'Success', MessageCodes.SUCCESS, CodeEnum.OK);
  }

  async signup(dto: CreateUserDto) {
    //generate the password hash

    const hash = await argon.hash(dto.password);

    // get the Client Role
    // TODO
    const role = await this.roleRepository.findOneBy({
      id: '79beb28a-a469-49eb-bda1-ae1c5e4a9261',
    });
    // search for another user with the same username
    const userExist = await this.userRepository.findOneBy({
      username: dto.username,
    });
    if (userExist) {
      return this.getReturn(false, CodeEnum.FORBIDDEN, null, CodeEnum.FORBIDDEN, `The user Name ${dto.username} is taken.`, MessageCodes.NOT_FOUND, CodeEnum.FORBIDDEN);
    }
    // otherwise continue
    //save the user in the BD
    let user = this.userRepository.create({
      hash: hash,
      role: role,
      name: dto.name,
      // email: dto.email,
      username: dto.username,
      // phone: dto.phone,
      isLogged: false,
      isActive: true,
      // lastname: dto.lastname,
    });
    user = await this.userRepository.save(user);

    //  check if user is already logged

    // return the save user token
        const accessInfo ={
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role.id
        }
        const accessPayload = {
          tokenKind: KindTokenEnum.ACCESS_TOKEN,
          userID: user.id,
          // req.customData, // Permite datos personalizados en el payload
        };
        const refreshPayload = {
          tokenKind: KindTokenEnum.REFRESH_TOKEN,
          userID: user.id,
          // req.customData, // Permite datos personalizados en el payload
        };

    const accessToken = this.generateAccessToken(accessPayload);
    const refreshToken = this.generateRefreshToken(refreshPayload);
    const data = {
      accessInfo: accessInfo,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
    return this.getReturn(true, CodeEnum.OK, data, CodeEnum.OK, 'Success', MessageCodes.SUCCESS, CodeEnum.OK);
  }


  async validateToken(token: string): Promise<boolean> {
    try {
      const secret = this.config.get('JWT_SECRET_KEY');
      await this.jwt.verifyAsync(token, {
        secret: secret,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async isTokenExpired(dto: TokenDto): Promise<any> {
    const token = dto.token;
    try {
      const secret = this.config.get('JWT_SECRET_KEY');
      await this.jwt.verifyAsync(token, {
        secret: secret,
        ignoreExpiration: true, // Verify everything except expiration
      });
      try {
        // Now check expiration
        await this.jwt.verifyAsync(token, {
          secret: secret,
        });
        return false; // Token is valid and not expired
      } catch (error) {
          return true; // Token is expired  
          }
    } catch (error) {
      return false; // Invalid token
    }
  }

  async loggedOut(dto: LogOutDto): Promise<any> {
    // find the user by username
    const user = await this.userRepository.findOneBy({
      id: dto.id,
    });

    if (!user) {
      return this.getReturn(false, CodeEnum.FORBIDDEN, null, CodeEnum.FORBIDDEN, ResourceEnum.USER_DOES_NOT_EXIST, MessageCodes.NOT_FOUND, CodeEnum.FORBIDDEN);
    }
    // otherwise continue
    // poner  is logged false
    user.isLogged = false;
    await this.userRepository.save(user);
    // return the save user token
    return true;
  }


  // other part
   generateAccessToken(customPayload: any) {
    return this.jwtService.sign(customPayload, { expiresIn: '1m' });
  }

  generateRefreshToken(customPayload: any) {
    return this.jwtService.sign(customPayload, { expiresIn: '5m' }); // Token de refresh con expiración diferente
  }

    // Método para verificar el token de refresh
  verifyRefreshToken(refreshToken: string) {
    const { valid, decoded } = this.verifyToken(refreshToken);
    if (valid) {
      const tokenKind = decoded.tokenKind;
      if (tokenKind === 'refresh_token') {
        return { valid: true, decoded , tokenKind: false }; // Token de refresh válido
      }
      return { valid: false, expired: false, tokenKind: false }; // Token de refesh inválido
    }
    return { valid: false, expired: false, tokenKind: false }; // Token de refesh inválido
  }

    // Método para verificar el token de acceso
  private verifyToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      console.log(decoded)
      return { valid: true, decoded };
    } catch (error) {
      return { valid: false, expired: false }; // Token inválido
    }
  }

  // Método para verificar el token de acceso
  verifyAccessToken(accessToken: string) {
    const { valid, decoded } = this.verifyToken(accessToken);
    if (valid) {
      const tokenKind = decoded.tokenKind;
      if (tokenKind === 'access_token') {
        return { valid: true, decoded , tokenKind: false }; // Token de access válido
      }
      return { valid: false, expired: false, tokenKind: false }; // Token de access inválido
    }
    return { valid: false, expired: false, tokenKind: false }; // Token de access inválido
  }

}
