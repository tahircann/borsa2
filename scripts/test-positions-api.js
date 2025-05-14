// Simple script to test if the positions API is accessible
const axios = require('axios');

async function testPositionsApi() {
  try {
    console.log('Testing connection to positions API...');
    const response = await axios.get('http://localhost:5056/positions', {
      timeout: 5000
    });
    
    console.log('Connection successful!');
    console.log('Status:', response.status);
    console.log('Number of positions:', Array.isArray(response.data) ? response.data.length : 'Not an array');
    console.log('Sample data:', JSON.stringify(response.data).substring(0, 200) + '...');
    return true;
  } catch (error) {
    console.error('Failed to connect to positions API:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received');
    } else {
      console.error('Error:', error.message);
    }
    console.error('Make sure the backend API is running at http://localhost:5056');
    return false;
  }
}

testPositionsApi(); 