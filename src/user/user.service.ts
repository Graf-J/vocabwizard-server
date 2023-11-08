import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.schema';
import { Model } from 'mongoose';
import { RegisterUserDto } from '../auth/dto/register-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(registerUserDto: RegisterUserDto) {
    const user = new this.userModel({
      name: registerUserDto.name,
      passwordHash: await bcrypt.hash(registerUserDto.password, 10),
      createdAt: Date.now(),
    });
    return await user.save();
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: string) {
    return `This action returns a #${id} user`;
  }

  async findOneByName(name: string) {
    return await this.userModel.findOne({ name });
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
