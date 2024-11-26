const fetch = require('node-fetch');

async function createAdmin() {
  try {
    const response = await fetch('http://localhost:3000/api/admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create admin user');
    }

    console.log('Success:', data.message);
    console.log('Admin credentials:');
    console.log('Email:', data.user.email);
    console.log('Password:', data.user.password);
    console.log('Please change your password after first login');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createAdmin();
