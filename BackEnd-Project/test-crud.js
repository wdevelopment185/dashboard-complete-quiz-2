const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test CRUD operations
async function testCRUD() {
  try {
    console.log('Testing CRUD operations...\n');

    // First, let's try to get all users (this should work without auth for testing)
    console.log('1. Testing GET /api/users');
    try {
      const usersResponse = await axios.get(`${BASE_URL}/api/users`);
      console.log('✅ GET users successful:', usersResponse.data);
    } catch (error) {
      console.log('❌ GET users failed:', error.response?.data || error.message);
    }

    // Test login to get a token
    console.log('\n2. Testing login to get token');
    let token = null;
    try {
      const loginResponse = await axios.post(`${BASE_URL}/api/login`, {
        email: 'test@example.com', // Replace with actual user email
        password: 'password123'    // Replace with actual password
      });
      token = loginResponse.data.token;
      console.log('✅ Login successful, token obtained');
    } catch (error) {
      console.log('❌ Login failed:', error.response?.data || error.message);
      console.log('Note: Create a test user first or use existing credentials');
      return;
    }

    if (!token) {
      console.log('❌ No token available, cannot test protected routes');
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    // Test GET users with auth
    console.log('\n3. Testing GET /api/users with auth');
    try {
      const usersResponse = await axios.get(`${BASE_URL}/api/users`, { headers });
      console.log('✅ GET users with auth successful');
      
      if (usersResponse.data.users && usersResponse.data.users.length > 0) {
        const testUser = usersResponse.data.users[0];
        console.log('Using test user:', testUser._id);

        // Test UPDATE user
        console.log('\n4. Testing PUT /api/users/:id');
        try {
          const updateData = {
            firstName: testUser.firstName + '_updated',
            lastName: testUser.lastName,
            email: testUser.email,
            country: testUser.country || 'Pakistan'
          };
          
          const updateResponse = await axios.put(`${BASE_URL}/api/users/${testUser._id}`, updateData, { headers });
          console.log('✅ UPDATE user successful:', updateResponse.data);
        } catch (error) {
          console.log('❌ UPDATE user failed:', error.response?.data || error.message);
        }

        // Test GET single user
        console.log('\n5. Testing GET /api/users/:id');
        try {
          const userResponse = await axios.get(`${BASE_URL}/api/users/${testUser._id}`, { headers });
          console.log('✅ GET single user successful:', userResponse.data);
        } catch (error) {
          console.log('❌ GET single user failed:', error.response?.data || error.message);
        }

        // Note: We won't test DELETE to avoid removing actual users
        console.log('\n6. DELETE test skipped to preserve data');
      }
    } catch (error) {
      console.log('❌ GET users with auth failed:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the test
testCRUD();