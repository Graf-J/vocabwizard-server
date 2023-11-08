import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from 'src/user/roles.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async generateJWT(id: string, role: Role) {
    return await this.jwtService.signAsync({ sub: id, role: role });
  }

  async validatePassword(password: string, passwordHash: string) {
    return await bcrypt.compare(password, passwordHash);
  }
}
