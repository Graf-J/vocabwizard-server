import { Controller, Get, Param, Delete, ConflictException, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { isValidObjectId } from 'mongoose';

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
  async remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
