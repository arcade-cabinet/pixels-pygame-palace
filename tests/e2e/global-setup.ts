import { type FullConfig, chromium } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global test setup...');

  // Create output directories
  const fs = await import('fs');
  const path = await import('path');

  const outputDir = path.join(process.cwd(), 'test-results');
  const screenshotsDir = path.join(outputDir, 'screenshots');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log('📁 Created output directories');

  // Verify server is running
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    console.log('⏳ Checking if server is responding...');
    await page.goto(config.use?.baseURL || 'http://localhost:5000', {
      timeout: 30000,
      waitUntil: 'networkidle',
    });

    console.log('✅ Server is responding');
    await browser.close();
  } catch (error) {
    console.error('❌ Server check failed:', error);
    throw error;
  }

  console.log('🎯 Global setup completed successfully');
}

export default globalSetup;
