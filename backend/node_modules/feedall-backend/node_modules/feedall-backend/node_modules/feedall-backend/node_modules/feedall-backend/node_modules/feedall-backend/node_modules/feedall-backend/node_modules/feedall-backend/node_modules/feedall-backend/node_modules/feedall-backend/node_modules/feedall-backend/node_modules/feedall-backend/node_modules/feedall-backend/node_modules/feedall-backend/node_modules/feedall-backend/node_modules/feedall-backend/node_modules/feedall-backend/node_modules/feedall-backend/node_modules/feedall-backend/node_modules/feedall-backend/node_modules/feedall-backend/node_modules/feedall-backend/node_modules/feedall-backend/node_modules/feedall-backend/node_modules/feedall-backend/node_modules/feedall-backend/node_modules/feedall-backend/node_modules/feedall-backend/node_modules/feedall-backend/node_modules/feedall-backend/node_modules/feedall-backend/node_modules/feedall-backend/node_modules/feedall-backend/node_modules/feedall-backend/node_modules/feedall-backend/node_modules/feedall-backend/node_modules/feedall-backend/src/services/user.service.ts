import { Prisma, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/middleware/error';

export class UserService {
  static async createUser(data: Prisma.UserCreateInput): Promise<User> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError(400, 'Email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  static async getUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  static async updateUser(
    id: string,
    data: Partial<Prisma.UserUpdateInput>
  ): Promise<User> {
    const user = await prisma.user.findUnique({ where: { id } });
    
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return prisma.user.update({
      where: { id },
      data,
    });
  }

  static async validatePassword(
    user: User,
    password: string
  ): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  static async updateLastLogin(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: {
        lastLogin: new Date(),
        failedLogins: 0,
      },
    });
  }

  static async incrementFailedLogins(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: {
        failedLogins: {
          increment: 1,
        },
      },
    });
  }
}
