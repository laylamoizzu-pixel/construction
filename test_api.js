const http = require('http');

const data = JSON.stringify({
    query: "I want copy pen and watch for my son",
    messages: [],
    maxResults: 5
});

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/assistant/recommend',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }
};

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        const parsed = JSON.parse(body);
        console.log('Response:', JSON.stringify(parsed, null, 2));
    });
});

req.on('error', (e) => {
    console.error('Error:', e.message);
});

req.write(data);
req.end();
