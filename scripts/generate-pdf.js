const puppeteer = require('puppeteer');
const path = require('path');
const jwt = require('jsonwebtoken');

(async () => {
    console.log('🚀 Starting PDF generation process...');
    const browser = await puppeteer.launch({ 
        headless: 'new',
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    });
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 800 });

    try {
        console.log('📸 Taking login screenshot...');
        await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
        await page.screenshot({ path: path.join(__dirname, '../docs/login-screenshot.png') });

        console.log('🔑 Injecting auth token for admin dashboard...');
        const token = jwt.sign(
            { id: '4c913056-f94b-49f7-89db-19e637506496', email: 'admin@cyber-shield.com', role: 'admin' },
            process.env.JWT_SECRET || 'fallback-secret-key-change-in-prod',
            { expiresIn: '1h' }
        );
        const userObj = { id: '4c913056-f94b-49f7-89db-19e637506496', email: 'admin@cyber-shield.com', role: 'admin', name: 'المسؤول' };
        
        await page.evaluate((token, user) => {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
        }, token, userObj);

        // Also set cookie if needed
        await page.setCookie({
            name: 'token',
            value: token,
            domain: 'localhost',
            path: '/',
            httpOnly: true
        });

        console.log('📸 Taking dashboard screenshot...');
        await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 2000)); // Wait for any animations
        await page.screenshot({ path: path.join(__dirname, '../docs/dashboard-screenshot.png') });

        console.log('📄 Rendering HTML Documentation...');
        const htmlPath = 'file://' + path.resolve(__dirname, '../docs/documentation.html').replace(/\\/g, '/');
        await page.goto(htmlPath, { waitUntil: 'networkidle2', timeout: 60000 });

        // Wait for mermaid to render
        await new Promise(r => setTimeout(r, 2000));

        console.log('🖨️ Generating PDF...');
        const pdfPath = 'C:/Users/Asus/.gemini/antigravity/brain/bb237412-9633-4b1c-9a9b-95ce39f5974e/CyberShield_Documentation.pdf';
        
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0px',
                bottom: '0px',
                left: '0px',
                right: '0px'
            }
        });

        console.log(`✅ PDF successfully generated at: ${pdfPath}`);
    } catch (error) {
        console.error('❌ Error during generation:', error);
    } finally {
        await browser.close();
    }
})();
