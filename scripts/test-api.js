// Native fetch in Node 18+

async function testAuth() {
    const baseUrl = 'http://localhost:3001/api/auth';

    console.log('Testing Registration...');
    const regRes = await fetch(`${baseUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Test User 2',
            email: `test${Date.now()}@example.com`,
            password: 'password123'
        })
    });

    const regData = await regRes.json();
    console.log('Register Response:', regRes.status, regData);

    if (regRes.status === 201) {
        console.log('Testing Login...');
        const loginRes = await fetch(`${baseUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: regData.user.email,
                password: 'password123'
            })
        });

        const loginData = await loginRes.json();
        console.log('Login Response:', loginRes.status, loginData);
    }
}

testAuth().catch(console.error);
