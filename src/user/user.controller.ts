import { Controller, Get, Param, Delete, UseGuards, Req, ConflictException } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RequiredRole } from 'src/auth/decorator/required-role.decorator';
import { Role } from './roles.enum';
import { RoleGuard } from 'src/auth/guard/role.guard';
import { UserDto } from './dto/user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ObjectIdValidationPipe } from 'src/util/pipe/objectid-validation.pipe';

@ApiTags('User')
@ApiBearerAuth()
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
  async remove(@Req() request, @Param('id', ObjectIdValidationPipe) id: string) {
    if (request.user.id === id) {
      throw new ConflictException('You are not allowed to delete yourself')
    }

    // Throws Exception if User not found
    await this.userService.findOne(id);
    // Delete User with all associated Decks and Cards
    await this.userService.remove(id);
  }
}
