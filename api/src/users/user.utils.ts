import { HttpException, HttpStatus } from '@nestjs/common';
import { Role } from 'src/shared/enums/role.enum';
import { UserEntity } from './user.entity';

export const verifySelfOrAdmin = (
  requester: UserEntity,
  requestedId: string,
) => {
  if (requester.id !== requestedId && requester.role !== Role.Admin) {
    throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
  }
};
