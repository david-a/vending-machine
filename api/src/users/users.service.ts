import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly users = [
    {
      id: 'asdfgh-124das-21d245-21fa2hs',
      username: 'john',
      email: 'john.doe@vending-machine-example.com',
    },
    {
      id: 'asd32h-1gawas-019c45-2dafa2hs',
      username: 'jane',
      email: 'jane.koo@vending-machine-example.com',
    },
  ];

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: string) {
    return this.users.find((user) => user.id === id);
  }

  findByUsernameOrEmail(usernameOrEmail: string) {
    return this.users.find(
      (user) =>
        user.username === usernameOrEmail || user.email === usernameOrEmail,
    );
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  generateFakeUserId = (username) => {
    const size = 12;
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = (hash + username.charCodeAt(i)) % 26;
    }
    return Array.from({ length: size }, (_, i) =>
      String.fromCharCode(97 + ((hash + i) % 26)),
    ).join('');
  };
}
