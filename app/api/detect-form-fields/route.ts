import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

interface DetectedField {
    id: string;
    selector: string;
    value: string;
    type: 'input' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'submit';
    name?: string;
    placeholder?: string;
    label?: string;
}

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        console.log('Detecting form fields for URL:', url);

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();

        // Set viewport
        await page.setViewport({ width: 1280, height: 720 });

        // Navigate to the page
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // Wait a bit for dynamic content to load
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Detect form fields
        const detectedFields = await page.evaluate(() => {
            const fields: DetectedField[] = [];
            let fieldId = 1;

            // Helper function to get field label
            const getFieldLabel = (element: Element): string => {
                // Try to find label by for attribute
                const id = element.getAttribute('id');
                if (id) {
                    const label = document.querySelector(`label[for="${id}"]`);
                    if (label) return label.textContent?.trim() || '';
                }

                // Try to find label as parent or sibling
                const parent = element.parentElement;
                if (parent) {
                    const label = parent.querySelector('label');
                    if (label) return label.textContent?.trim() || '';
                }

                // Try to find label as previous sibling
                const prevSibling = element.previousElementSibling;
                if (prevSibling && prevSibling.tagName === 'LABEL') {
                    return prevSibling.textContent?.trim() || '';
                }

                return '';
            };

            // Helper function to generate selector
            const generateSelector = (element: Element): string => {
                const tag = element.tagName.toLowerCase();
                const id = element.getAttribute('id');
                const name = element.getAttribute('name');
                const className = element.getAttribute('class');

                if (id) return `${tag}[id="${id}"]`;
                if (name) return `${tag}[name="${name}"]`;
                if (className) {
                    const classes = className.split(' ').filter((c) => c.trim());
                    if (classes.length > 0) {
                        return `${tag}.${classes.join('.')}`;
                    }
                }

                // Fallback to nth-child
                const parent = element.parentElement;
                if (parent) {
                    const siblings = Array.from(parent.children).filter((child) => child.tagName === element.tagName);
                    const index = siblings.indexOf(element) + 1;
                    return `${tag}:nth-child(${index})`;
                }

                return tag;
            };

            // Detect input fields
            const inputs = document.querySelectorAll('input');
            inputs.forEach((input) => {
                const type = input.getAttribute('type') || 'text';
                let fieldType: DetectedField['type'] = 'input';

                if (type === 'checkbox') fieldType = 'checkbox';
                else if (type === 'radio') fieldType = 'radio';
                else if (type === 'submit' || type === 'button') fieldType = 'submit';

                const label = getFieldLabel(input);
                const placeholder = input.getAttribute('placeholder') || '';
                const name = input.getAttribute('name') || '';

                fields.push({
                    id: `field-${fieldId++}`,
                    selector: generateSelector(input),
                    value: '',
                    type: fieldType,
                    name,
                    placeholder,
                    label,
                });
            });

            // Detect textarea fields
            const textareas = document.querySelectorAll('textarea');
            textareas.forEach((textarea) => {
                const label = getFieldLabel(textarea);
                const placeholder = textarea.getAttribute('placeholder') || '';
                const name = textarea.getAttribute('name') || '';

                fields.push({
                    id: `field-${fieldId++}`,
                    selector: generateSelector(textarea),
                    value: '',
                    type: 'textarea',
                    name,
                    placeholder,
                    label,
                });
            });

            // Detect select fields
            const selects = document.querySelectorAll('select');
            selects.forEach((select) => {
                const label = getFieldLabel(select);
                const name = select.getAttribute('name') || '';

                fields.push({
                    id: `field-${fieldId++}`,
                    selector: generateSelector(select),
                    value: '',
                    type: 'select',
                    name,
                    label,
                });
            });

            // Detect button submit fields
            const buttons = document.querySelectorAll('button');
            buttons.forEach((button) => {
                const type = button.getAttribute('type') || '';
                const text = button.textContent?.trim() || '';

                // Check if it's a submit button
                if (
                    type === 'submit' ||
                    text.toLowerCase().includes('submit') ||
                    text.toLowerCase().includes('login') ||
                    text.toLowerCase().includes('sign in') ||
                    text.toLowerCase().includes('register') ||
                    text.toLowerCase().includes('create') ||
                    text.toLowerCase().includes('save') ||
                    text.toLowerCase().includes('send')
                ) {
                    const label = getFieldLabel(button);
                    const name = button.getAttribute('name') || '';

                    fields.push({
                        id: `field-${fieldId++}`,
                        selector: generateSelector(button),
                        value: text,
                        type: 'submit',
                        name,
                        label,
                    });
                }
            });

            return fields;
        });

        await browser.close();

        console.log(`Detected ${detectedFields.length} form fields`);

        return NextResponse.json({
            success: true,
            fields: detectedFields,
            message: `Detected ${detectedFields.length} form fields`,
        });
    } catch (error) {
        console.error('Error detecting form fields:', error);
        return NextResponse.json(
            {
                error: 'Failed to detect form fields',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 },
        );
    }
}
