import { HttpException, HttpStatus } from '@nestjs/common';
import { Role } from 'src/shared/enums/role.enum';

export const verifySelfOrAdmin = (requester: any, requestedId: string) => {
  const requesterId = requester.id || requester._id;
  if (requesterId !== requestedId && requester.role !== Role.Admin) {
    throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
  }
};
