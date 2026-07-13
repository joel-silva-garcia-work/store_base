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
import { AuthDto } from './dto/auth.dto';
import { TokenDto } from './dto/token.dto';
import { LogOutDto } from './dto/logOut.dto';
import { LoginDto } from './dto/login.dto';
import { Rol } from '../rol/entities/rol.entity';
import { CreateUserDto } from '../user/dto';
import * as ldap from 'ldapjs';
import { ReturnDto } from 'src/common/base/dto/return.dto';
import { CodeEnum } from 'src/common/enum/code.enum';
import { AUTH_MESSAGES } from 'src/common/resource/auth.messages';

@Injectable({})
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly SUPER_ADMIN_NAME = 'Super Admin';

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Rol)
    private roleRepository: Repository<Rol>,
    private jwt: JwtService,
    private config: ConfigService,
    private readonly jwtService: JwtService) 
  {}

  async login(dto: LoginDto) {
    // find the user by username
    const user = await this.userRepository.findOne({
      where: { username: dto.username },
    });

    if (!user) {
      throw new ForbiddenException('User Name do not exist');
    }
    // otherwise continue
    // compare password
    const pwMatch = await argon.verify(user.hash, dto.password);
    // if password incorrect throw an exception
    if (!pwMatch) {
      throw new ForbiddenException('Password incorrects.');
    }
    // otherwise continue
    // check if user is already logged
    const role = await this.roleRepository.findOne({
      where: { id: '792e024b-f781-4f39-ba6a-2445fc1db712' },
    });


    if (user.role.id == role.id) { 
      user.isLogged = false;
    }
    if (user.isLogged) {
      throw new ForbiddenException('User already logged');
    }

    if (user.role.id != role.id) {
      console.log('no es el mismo');
      user.isLogged = true;
    }

    await this.userRepository.save(user);
    // return the save user token

    const refresh_token = await this.signToken(user.id, user.username, '1d');
    return {
      userID: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      // lastname: user.lastname,
      // phone: user.phone,
      refresh_token: refresh_token,
    };
  }

  async logOut(dto: LoginDto) {
    // find the user by username
    const user = await this.userRepository.findOneBy({
      username: dto.username,
    });

    if (!user) {
      throw new ForbiddenException('User Name do not exist');
    }
    // otherwise continue
    // poner  is logged false
    user.isLogged = false;
    await this.userRepository.save(user);
    // return the save user token
    return true;
  }

  async signupAdmin(dto: CreateUserDto) {
    // to register only the first admin
    //generate the password hash
    const hash = await argon.hash(dto.password);

    // get the Admin Role
    // TODO
    const role = await this.roleRepository.findOne({
      where: {
        id: '792e024b-f781-4f39-ba6a-2445fc1db712',
        // id:"dc3ab524-d911-4f8a-93a6-5ab0a524f2bc"
      },
    });
    // search for another user with the same username
    let userExist = await this.userRepository.findOneBy({
      username: dto.username,
    });
    if (userExist) {
      throw new ConflictException(`The user Name ${dto.username} is taken.`);
    }
    // search if exist any admin
    // TODO
    if (role) {
      userExist = await this.userRepository.findOneBy({
        role: role,
      });
      if (userExist) {
        throw new ConflictException(`There is an admin already.`);
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
    return this.signToken(user.id, user.username, '1m');
  }

  async signup(dto: CreateUserDto) {
    //generate the password hash
    console.log(dto);

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
      throw new ConflictException(`The user Name ${dto.username} is taken.`);
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
    const access_token = this.signToken(user.id, user.username, '1m');
    const refresh_token = this.signToken(user.id, user.username, '480m');
    return {
      rol: user.role.id,
      name: user.name,
      email: user.email,
      username: user.username,
      access_token: access_token,
      refresh_token: refresh_token,
    };
  }

  async signToken(
    userID: string,
    username: string,
    time: string,
  ): Promise<any> {
    const payload = {
      sub: userID,
      username: username,
    };
    const secret = this.config.get('JWT_SECRET_KEY');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: time,
      secret: secret,
    });
    return token;
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
      throw new ForbiddenException('User Name do not exist');
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
    return this.jwtService.sign(customPayload, { expiresIn: '3m' });
  }

  generateRefreshToken(customPayload: any) {
    return this.jwtService.sign(customPayload, { expiresIn: '60m' }); // Token de refresh con expiración diferente
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
