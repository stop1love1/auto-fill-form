# Auto Form Filler

A modern Next.js application that uses Puppeteer to automate form filling on web pages. Features a beautiful UI built with shadcn/ui components and persistent configuration storage.

## ✨ Features

-   🚀 **Automated Form Filling**: Uses Puppeteer to automatically fill forms on any website
-   🔐 **Authentication Support**: Multiple authentication methods for login-protected websites
-   ⏱️ **Configurable Load Delay**: Set custom delay times for page loading
-   🔧 **Dynamic Field Management**: Add, remove, and configure form fields on the fly
-   📝 **Multiple Field Types**: Support for input, select, textarea, checkbox, and radio fields
-   🎨 **Modern UI**: Beautiful, responsive interface built with shadcn/ui and TailwindCSS
-   💾 **Configuration Persistence**: Save and load configurations using localStorage
-   📊 **Real-time Logs**: Monitor automation progress with detailed logging and export options
-   📸 **Screenshot Capture**: Automatic screenshot capture for verification
-   🔄 **Configuration Manager**: Save, load, and manage multiple automation configurations
-   📱 **Responsive Design**: Works perfectly on desktop and mobile devices

## 🛠️ Prerequisites

-   Node.js 18+
-   npm or yarn
-   Windows, macOS, or Linux

## 🚀 Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd auto-fill-form
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:4002](http://localhost:4002) in your browser.

## 📖 Usage

### Basic Setup

1. **Enter Website URL**: Input the URL of the webpage containing the form you want to automate
2. **Configure Authentication** (if needed): Use the Authentication tab to set up login for protected websites
3. **Set Load Delay**: Configure how many seconds to wait after the page loads before filling forms
4. **Add Form Fields**: Use the Form Fields tab to configure form elements
5. **Save Configuration**: Use the Configuration Manager to save your setup for future use

### Authentication Support

For websites that require login, the app supports multiple authentication methods:

-   **Manual Login**: Browser opens and waits for you to login manually
-   **Credentials Login**: Automatically login using username/password
-   **Cookies Authentication**: Use exported cookies from your browser
-   **Session Data**: Use localStorage/sessionStorage data

See [Authentication Guide](docs/AUTHENTICATION.md) for detailed instructions.

### Configuration Management

The app includes a powerful configuration manager that allows you to:

-   **Save Configurations**: Save your current setup with a custom name
-   **Load Configurations**: Quickly load previously saved configurations
-   **Delete Configurations**: Remove configurations you no longer need
-   **Persistent Storage**: All configurations are saved to your browser's localStorage

### Field Configuration

For each form field, you need to specify:

-   **Selector**: CSS selector to identify the form element
-   **Type**: Type of form element (input, select, textarea, checkbox, radio)
-   **Value**: The value to fill in the form field

### Common Selector Examples

```css
/* Input fields */
input[name="email"]
input[type="text"]
#username
.form-input

/* Select dropdowns */
select[name="country"]
#category

/* Textareas */
textarea[name="message"]
.comment-box

/* Checkboxes */
input[type="checkbox"]
input[name="agree"]

/* Radio buttons */
input[type="radio"]
input[name="gender"]
```

### Example Configuration

Here's an example for the test form:

```json
{
    "url": "http://localhost:4002/test-form.html",
    "loadDelay": 2,
    "fields": [
        {
            "selector": "input[name='name']",
            "type": "input",
            "value": "John Doe"
        },
        {
            "selector": "input[name='email']",
            "type": "input",
            "value": "john.doe@example.com"
        },
        {
            "selector": "input[name='phone']",
            "type": "input",
            "value": "+1-555-123-4567"
        },
        {
            "selector": "select[name='country']",
            "type": "select",
            "value": "US"
        },
        {
            "selector": "select[name='subject']",
            "type": "select",
            "value": "general"
        },
        {
            "selector": "textarea[name='message']",
            "type": "textarea",
            "value": "This is a test message from the automated form filler."
        },
        {
            "selector": "input[name='gender'][value='male']",
            "type": "radio",
            "value": "male"
        },
        {
            "selector": "input[name='newsletter']",
            "type": "checkbox",
            "value": "true"
        },
        {
            "selector": "input[name='terms']",
            "type": "checkbox",
            "value": "true"
        }
    ]
}
```

## 🔧 How It Works

1. **Browser Launch**: Puppeteer launches a Chrome browser instance
2. **Page Navigation**: Navigates to the specified URL
3. **Load Delay**: Waits for the configured delay time
4. **Field Detection**: Waits for each form element to be present
5. **Form Filling**: Fills each field based on its type and value
6. **Screenshot**: Captures a screenshot of the filled form
7. **Cleanup**: Closes the browser and returns results

## 📋 Field Types

### Input/Textarea

-   Uses `page.type()` to fill text content
-   Works with text inputs, email inputs, password fields, etc.

### Select

-   Uses `page.type()` to simulate typing the option value
-   Supports dropdown selections

### Checkbox

-   Uses `page.click()` to toggle the checkbox
-   Set value to "true" to check, "false" to uncheck

### Radio

-   Uses `page.click()` to select the radio button option

## 🎨 UI Components

The application uses shadcn/ui components for a consistent and modern design:

-   **Tabs**: Organized interface with Configuration, Form Fields, and Logs tabs
-   **Cards**: Clean layout for different sections
-   **Buttons**: Consistent button styling with loading states
-   **Inputs**: Modern form inputs with proper validation
-   **Select**: Dropdown components for field type selection
-   **Dialog**: Modal dialogs for configuration management
-   **ScrollArea**: Smooth scrolling for logs and long content

## 💾 Local Storage

The application uses localStorage to persist:

-   **Current Configuration**: Your active form configuration
-   **Saved Configurations**: Multiple named configurations
-   **Execution Logs**: Recent automation logs

## 🔍 Troubleshooting

### Common Issues

1. **Element Not Found**

    - Verify the CSS selector is correct
    - Check if the element is in an iframe
    - Ensure the page has fully loaded

2. **Timing Issues**

    - Increase the load delay
    - Check if the page uses dynamic loading
    - Verify network connectivity

3. **Browser Launch Issues**
    - Ensure Chrome/Chromium is installed
    - Check system permissions
    - Try running in headless mode

### Debug Tips

1. **Use Browser DevTools**: The browser opens in non-headless mode for debugging
2. **Check Console Logs**: Monitor the execution logs in the UI
3. **Verify Selectors**: Use browser dev tools to test CSS selectors
4. **Screenshot Review**: Check the captured screenshot for verification
5. **Export Logs**: Use the download feature to save logs for analysis

## ⚙️ Configuration Options

### Browser Settings

The application uses the following Puppeteer launch options:

```javascript
{
  headless: false, // Set to true for production
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu'
  ]
}
```

### Timeout Settings

-   **Page Load**: 30 seconds
-   **Element Wait**: 10 seconds per field
-   **Network Idle**: Waits for network to be idle for 500ms

## 🔒 Security Considerations

-   Only use on trusted websites
-   Be cautious with sensitive data in form values
-   Consider running in headless mode for production
-   Review website terms of service before automation
-   Local storage data is only accessible in your browser

## 🏗️ Development

### Project Structure

```
auto-fill-form/
├── app/
│   ├── (pages)/
│   │   └── (home)/
│   │       └── Home.tsx          # Main UI component
│   ├── api/
│   │   └── automate-form/
│   │       └── route.ts          # Puppeteer automation API
│   └── globals.css               # Global styles
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── ConfigurationManager.tsx  # Configuration management
│   ├── FormFieldEditor.tsx       # Form field editor
│   └── LogsPanel.tsx             # Logs display
├── hooks/
│   └── use-local-storage.ts      # localStorage hook
├── public/
│   └── test-form.html            # Test form for demo
└── package.json
```

### Technologies Used

-   **Next.js 15**: React framework
-   **TypeScript**: Type safety
-   **TailwindCSS**: Styling
-   **shadcn/ui**: Modern UI components
-   **Puppeteer**: Browser automation
-   **Lucide React**: Icons

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:

1. Check the troubleshooting section
2. Review the console logs
3. Create an issue with detailed information
4. Include the URL and field configuration that's causing problems

## 🧪 Testing

Use the included test form at `http://localhost:4002/test-form.html` to test the automation functionality. The form includes examples of all supported field types with visible CSS selectors for easy configuration.
