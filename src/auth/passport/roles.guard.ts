import { UserService } from '@/src/user/user.service';
// src/auth/passport/roles.guard.ts

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly UserService: UserService,
  ) {}

  async canActivate(context: ExecutionContext) {
    // Retrieve roles metadata for the handler
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles) {
      return true; // If no roles are required, allow access
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // The user object should have been populated by JwtAuthGuard

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const userFromDb = await this.UserService.findOne(user.id); // Assuming user.id is available and findOne() gets the user
    const userRole = userFromDb?.role; // Assuming user has a roles field
    // Check if user has one of the required roles
    const hasRole = requiredRoles.some((role) => {
      if (role === 'admin') {
        // Only admin can access resources with the 'admin' role
        return userRole === 'admin';
      }
      if (role === 'user') {
        // User or admin can access resources with the 'user' role
        return userRole === 'user' || userRole === 'admin';
      }
      return false; // If the role is not recognized, deny access
    });

    if (!hasRole) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true; // Allow access if roles match
  }
}
