import axios from 'axios';

async function testBackend() {
  try {
    const res = await axios.get('http://127.0.0.1:5001/');
    console.log('Backend / response:', res.data);
    const res2 = await axios.get('http://127.0.0.1:5001/latest-result');
    console.log('Backend /latest-result response:', res2.data);
  } catch (err) {
    console.error('Backend test failed:', err.message);
    if (err.response) {
      console.error('Response status:', err.response.status);
      console.error('Response data:', err.response.data);
    }
  }
}

testBackend();
