// Native fetch in Node 18+

async function testApi() {
    const baseUrl = 'http://localhost:3001/api';
    let token = '';
    let termId = 0;

    console.log('--- 1. Testing Registration ---');
    const regRes = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Admin Tester',
            email: `admin${Date.now()}@test.com`,
            password: 'password123'
        })
    });
    const regData = await regRes.json();
    console.log('Register:', regRes.status, regData.message);

    console.log('\n--- 2. Testing Login ---');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: regData.user ? regData.user.email : 'admin@test.com', // Fallback if reg failed (user might exist)
            password: 'password123'
        })
    });
    const loginData = await loginRes.json();
    token = loginData.token;
    console.log('Login:', loginRes.status, token ? 'Token Received' : 'No Token');

    console.log('\n--- 3. Testing Create Term ---');
    const termRes = await fetch(`${baseUrl}/terms`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${token}` // If we enforced auth
        },
        body: JSON.stringify({
            termEn: 'API Test Term',
            termAr: 'مصطلح اختبار',
            definitionEn: 'A term created via API test',
            definitionAr: 'مصطلح تم إنشاؤه عبر اختبار API',
            example: 'Example usage',
            level: 'مبتدئ',
            categoryId: 1
        })
    });
    const termData = await termRes.json();
    termId = termData.id;
    console.log('Create Term:', termRes.status, termData);

    console.log('\n--- 4. Testing Get Terms ---');
    const getRes = await fetch(`${baseUrl}/terms?q=API`);
    const getData = await getRes.json();
    console.log('Get Terms:', getRes.status, `Found ${getData.terms?.length} terms`);

    if (termId) {
        console.log('\n--- 5. Testing Delete Term ---');
        const delRes = await fetch(`${baseUrl}/terms/${termId}`, {
            method: 'DELETE'
        });
        console.log('Delete Term:', delRes.status);
    }
}

testApi().catch(console.error);
