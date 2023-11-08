import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.schema';
import { Model, isValidObjectId } from 'mongoose';
import { RegisterUserDto } from '../auth/dto/register-user.dto';
import * as bcrypt from 'bcrypt';
import { Role } from './roles.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async create(registerUserDto: RegisterUserDto) {
    // Set Role to Admin if it is the first User
    let role = Role.user;
    if(await this.userModel.count() === 0) {
      role = Role.administrator;
    }

    // Create and save the User
    const user = new this.userModel({
      name: registerUserDto.name,
      passwordHash: await bcrypt.hash(registerUserDto.password, 10),
      role: role,
      createdAt: Date.now(),
    });
    return await user.save();
  }

  async findAll() {
    return await this.userModel.find();
  }

  async findOne(id: string) {
    return await this.userModel.findById(id);
  }

  async findOneByName(name: string) {
    return await this.userModel.findOne({ name });
  }

  async remove(id: string) {
    if (!isValidObjectId(id)) {
      throw new ConflictException('Invalid User-Id');
    }

    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with Id ${ id } not found`)
    }
    
    await this.userModel.deleteOne({ _id: id });
  }
}
