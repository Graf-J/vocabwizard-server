import { Controller, Get, Param, Delete, UseGuards, Req, ConflictException, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RequiredRole } from 'src/auth/decorator/required-role.decorator';
import { Role } from './roles.enum';
import { RoleGuard } from 'src/auth/guard/role.guard';
import { isValidObjectId } from 'mongoose';
import { UserDto } from './dto/user.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('User')
@UseGuards(AuthGuard, RoleGuard)
@RequiredRole(Role.administrator)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll() {
    const users = await this.userService.findAll();
    return users.map(user => new UserDto(user));
  }

  @Delete(':id')
  async remove(@Req() request, @Param('id') id: string) {
    if (request.user.id === id) {
      throw new ConflictException('You are not allowed to delete yourself')
    }
    
    if (!isValidObjectId(id)) {
      throw new ConflictException('Invalid User-Id');
    }

    // TODO: Throw Exception in Method
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with Id ${ id } not found`)
    }

    await this.userService.remove(id);
  }
}
