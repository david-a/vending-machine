import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/shared/enums/role.enum';
import { ROLES_KEY } from 'src/shared/decorators/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { verify } from 'crypto';
import { UserEntity } from 'src/users/user.entity';

@Injectable()
export class AppGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    if (!(await super.canActivate(context))) return false;
    const { user, path } = context.switchToHttp().getRequest();

    if (path === '/auth/refreshToken') return true;
    if (!user.username) return false; // which means the user is using the refresh token

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }

    return requiredRoles.some((role) => user.role === role);
  }
}
