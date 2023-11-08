import { ConflictException, Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { Role } from 'src/user/roles.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  async register(registerUser: RegisterUserDto) {
    // Check if User already exists
    const user = await this.userService.findOneByName(registerUser.name);
    if (user) {
      throw new ConflictException(`User with name ${registerUser.name} already exist`);
    }

    // Create and return User
    return await this.userService.create(registerUser);
  }

  async generateJWT(id: string, role: Role) {
    return await this.jwtService.signAsync({ sub: id, role: role });
  }
}
