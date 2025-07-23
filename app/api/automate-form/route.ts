import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

interface FormField {
    id: string;
    selector: string;
    value: string;
    type: 'input' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'submit';
}

interface AutomationConfig {
    url: string;
    loadDelay: number;
    fields: FormField[];
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
