import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Auto Fill Form',
    description: 'Auto Fill Form by stop1love1',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
                <main className="flex-1">{children}</main>

                {/* Footer */}
                <footer className="bg-white border-t border-gray-200 py-4 px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-sm text-gray-600">Auto Fill Form</span>
                            </div>
                            <div className="text-sm text-gray-500">
                                Created by <span className="font-semibold text-blue-600">stop1love1</span>
                            </div>
                        </div>
                    </div>
                </footer>
            </body>
        </html>
    );
}
