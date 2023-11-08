import { Controller, Get, Param, Delete, UseGuards, Req, ConflictException } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RequiredRole } from 'src/auth/decorator/required-role.decorator';
import { Role } from './roles.enum';
import { RoleGuard } from 'src/auth/guard/role.guard';

@UseGuards(AuthGuard, RoleGuard)
@RequiredRole(Role.administrator)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll() {
    const users = await this.userService.findAll();

    return users.map(mongoUser => {
      return {
        id: mongoUser.id,
        name: mongoUser.name,
        role: mongoUser.role,
        createdAt: mongoUser.createdAt,
      };
    });
  }

  @Delete(':id')
  async remove(@Req() request, @Param('id') id: string) {
    if (request.user.id === id) {
      throw new ConflictException('You are not allowed to delete yourself')
    }

    return this.userService.remove(id);
  }
}
