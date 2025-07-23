import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

interface FormField {
    id: string;
    selector: string;
    value: string;
    type: 'input' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'submit';
}

interface AuthenticationConfig {
    enabled: boolean;
    method: 'manual' | 'credentials' | 'cookies' | 'session';
    credentials?: {
        username?: string;
        password?: string;
        usernameSelector?: string;
        passwordSelector?: string;
        submitSelector?: string;
    };
    cookies?: string;
    sessionData?: string;
    waitAfterLogin?: number;
}

interface AutomationConfig {
    url: string;
    loadDelay: number;
    fields: FormField[];
    authentication?: AuthenticationConfig;
}

export async function POST(request: NextRequest) {
    let browser;

    try {
        const config: AutomationConfig = await request.json();

        // Validate input
        if (!config.url || !config.fields || config.fields.length === 0) {
            return NextResponse.json({ error: 'Invalid configuration. URL and fields are required.' }, { status: 400 });
        }

        // Launch browser
        browser = await puppeteer.launch({
            headless: false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
            ],
        });

        const page = await browser.newPage();

        // Set viewport
        await page.setViewport({ width: 1280, height: 720 });

        // Navigate to the URL
        console.log(`Navigating to: ${config.url}`);
        await page.goto(config.url, {
            waitUntil: 'networkidle2',
            timeout: 30000,
        });
        console.log('Page loaded successfully');

        // Handle authentication if enabled
        if (config.authentication?.enabled) {
            console.log('Authentication is enabled, processing login...');

            switch (config.authentication.method) {
                case 'manual':
                    console.log('Manual login mode - waiting for user to login...');
                    if (config.authentication?.waitAfterLogin) {
                        console.log(`Waiting ${config.authentication?.waitAfterLogin} seconds for manual login...`);
                        await new Promise((resolve) =>
                            setTimeout(resolve, (config.authentication?.waitAfterLogin || 10) * 1000),
                        );
                        console.log('Manual login wait completed');
                    }
                    break;

                case 'credentials':
                    if (config.authentication.credentials?.username && config.authentication.credentials?.password) {
                        console.log('Processing credentials login...');

                        const credentials = config.authentication.credentials;
                        const usernameSelector =
                            credentials.usernameSelector ||
                            'input[name="username"], input[name="email"], #username, #email';
                        const passwordSelector = credentials.passwordSelector || 'input[name="password"], #password';
                        const submitSelector =
                            credentials.submitSelector || 'button[type="submit"], input[type="submit"], .login-button';

                        try {
                            // Wait for login form to be present
                            await page.waitForSelector(usernameSelector, { timeout: 10000 });
                            await page.waitForSelector(passwordSelector, { timeout: 10000 });

                            // Fill username
                            console.log(`Filling username: ${credentials.username}`);
                            await page.type(usernameSelector, credentials.username || '');

                            // Fill password
                            console.log('Filling password...');
                            await page.type(passwordSelector, credentials.password || '');

                            // Submit form
                            console.log('Submitting login form...');
                            await page.click(submitSelector);

                            // Wait for navigation after login
                            await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
                            console.log('Login completed successfully');
                        } catch (error) {
                            console.log(`Error during credentials login: ${error}`);
                        }
                    }
                    break;

                case 'cookies':
                    if (config.authentication.cookies) {
                        console.log('Processing cookies authentication...');
                        try {
                            const cookies = JSON.parse(config.authentication.cookies);
                            await page.setCookie(...cookies);
                            console.log(`Set ${cookies.length} cookies`);

                            // Reload page with cookies
                            await page.reload({ waitUntil: 'networkidle2' });
                            console.log('Page reloaded with cookies');
                        } catch (error) {
                            console.log(`Error setting cookies: ${error}`);
                        }
                    }
                    break;

                case 'session':
                    if (config.authentication.sessionData) {
                        console.log('Processing session data...');
                        try {
                            const sessionData = JSON.parse(config.authentication.sessionData);

                            // Set localStorage
                            if (sessionData.localStorage) {
                                await page.evaluateOnNewDocument((data) => {
                                    for (const [key, value] of Object.entries(data)) {
                                        localStorage.setItem(key, value as string);
                                    }
                                }, sessionData.localStorage);
                            }

                            // Set sessionStorage
                            if (sessionData.sessionStorage) {
                                await page.evaluateOnNewDocument((data) => {
                                    for (const [key, value] of Object.entries(data)) {
                                        sessionStorage.setItem(key, value as string);
                                    }
                                }, sessionData.sessionStorage);
                            }

                            // Reload page with session data
                            await page.reload({ waitUntil: 'networkidle2' });
                            console.log('Page reloaded with session data');
                        } catch (error) {
                            console.log(`Error setting session data: ${error}`);
                        }
                    }
                    break;
            }
        }

        // Wait for the specified delay
        if (config.loadDelay > 0) {
            console.log(`Waiting for ${config.loadDelay} seconds...`);
            await new Promise((resolve) => setTimeout(resolve, config.loadDelay * 1000));
            console.log('Delay completed');
        }

        // Fill form fields
        console.log(`Starting to fill ${config.fields.length} fields...`);
        for (const field of config.fields) {
            try {
                console.log(`Processing field: ${field.selector} (${field.type})`);

                // Wait for the element to be present
                console.log(`Waiting for element: ${field.selector}`);
                await page.waitForSelector(field.selector, { timeout: 10000 });
                console.log(`Element found: ${field.selector}`);

                // Handle different field types
                switch (field.type) {
                    case 'input':
                    case 'textarea':
                        console.log(`Typing "${field.value}" into ${field.selector}`);
                        await page.type(field.selector, field.value);
                        break;

                    case 'select':
                        console.log(`Selecting "${field.value}" in ${field.selector}`);
                        await page.type(field.selector, field.value);
                        break;

                    case 'checkbox':
                        if (field.value.toLowerCase() === 'true') {
                            console.log(`Checking checkbox: ${field.selector}`);
                            await page.click(field.selector);
                        } else {
                            console.log(`Unchecking checkbox: ${field.selector}`);
                            await page.click(field.selector);
                        }
                        break;

                    case 'radio':
                        console.log(`Selecting radio: ${field.selector}`);
                        await page.click(field.selector);
                        break;

                    case 'submit':
                        console.log(`Clicking submit button: ${field.selector}`);
                        await page.click(field.selector);
                        break;

                    default:
                        console.log(`Typing "${field.value}" into ${field.selector}`);
                        await page.type(field.selector, field.value);
                        break;
                }

                console.log(`✓ Successfully filled field: ${field.selector} with value: "${field.value}"`);
            } catch (error) {
                console.log(`✗ Error filling field ${field.selector}: ${error}`);
            }
        }

        // Take a screenshot for verification
        console.log('Taking screenshot...');
        const screenshot = await page.screenshot({
            fullPage: true,
            type: 'png',
        });
        console.log('Screenshot captured');

        console.log('Form filling completed. Browser will remain open for manual inspection.');
        console.log('You can close the browser manually when done.');

        return NextResponse.json({
            message: 'Form automation completed successfully. Browser remains open.',
            fieldsProcessed: config.fields.length,
            screenshot: Buffer.from(screenshot).toString('base64'),
        });
    } catch (error) {
        console.error('Automation error:', error);

        if (browser) {
            await browser.close();
        }

        return NextResponse.json(
            {
                error: 'Automation failed',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 },
        );
    }
}
