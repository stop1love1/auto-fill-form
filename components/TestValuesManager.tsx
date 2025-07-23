'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Trash2, FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TestValuesManagerProps {
    onRunTest: (testValue: string) => void;
    isRunning: boolean;
}

export function TestValuesManager({ onRunTest, isRunning }: TestValuesManagerProps) {
    const [testValues, setTestValues] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const stored = localStorage.getItem('test-values');
        if (stored) {
            try {
                setTestValues(JSON.parse(stored));
            } catch (error) {
                console.error('Failed to parse test values:', error);
            }
        }
    }, []);

    const handleRunTest = (testValue: string) => {
        onRunTest(testValue);
    };

    const handleRunAll = () => {
        if (testValues.length > 0) {
            handleRunTest(testValues[currentIndex]);
        }
    };

    const handleNext = () => {
        if (currentIndex < testValues.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const clearTestValues = () => {
        setTestValues([]);
        setCurrentIndex(0);
        localStorage.removeItem('test-values');
    };

    if (testValues.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <FileText className="w-5 h-5" />
                        Test Values
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            No test values loaded. Import a TXT file with test values to get started.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Test Values
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                            {currentIndex + 1} / {testValues.length}
                        </Badge>
                        <Button onClick={clearTestValues} variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Current Test Value */}
                <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Current Test:</p>
                    <p className="text-sm text-muted-foreground break-all">{testValues[currentIndex]}</p>
                </div>

                {/* Navigation Controls */}
                <div className="flex gap-2">
                    <Button
                        onClick={handlePrevious}
                        disabled={currentIndex === 0 || isRunning}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                    >
                        Previous
                    </Button>
                    <Button onClick={handleRunAll} disabled={isRunning} size="sm" className="flex-1">
                        <Play className="w-4 h-4 mr-2" />
                        Run Test
                    </Button>
                    <Button
                        onClick={handleNext}
                        disabled={currentIndex === testValues.length - 1 || isRunning}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                    >
                        Next
                    </Button>
                </div>

                {/* All Test Values */}
                <div>
                    <p className="text-sm font-medium mb-2">All Test Values:</p>
                    <ScrollArea className="h-32 border rounded-md p-2">
                        <div className="space-y-1">
                            {testValues.map((value, index) => (
                                <div
                                    key={index}
                                    className={`text-xs p-2 rounded cursor-pointer transition-colors ${
                                        index === currentIndex ? 'bg-blue-100 text-blue-900' : 'hover:bg-muted'
                                    }`}
                                    onClick={() => setCurrentIndex(index)}
                                >
                                    {value}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </CardContent>
        </Card>
    );
}
