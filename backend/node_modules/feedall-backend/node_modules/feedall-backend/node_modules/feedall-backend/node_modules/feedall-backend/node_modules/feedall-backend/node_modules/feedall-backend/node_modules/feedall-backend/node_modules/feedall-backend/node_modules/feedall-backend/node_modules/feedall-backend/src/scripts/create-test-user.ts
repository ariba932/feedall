import { UserService } from '../services/user.service';

async function createTestUser() {
  try {
    const user = await UserService.createUser({
      email: 'test@example.com',
      password: 'Test123!',
      firstName: 'Test',
      lastName: 'User',
      role: 'ADMIN',
    });

    console.log('Test user created successfully:', {
      id: user.id,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error('Error creating test user:', error);
  }
}

createTestUser();
