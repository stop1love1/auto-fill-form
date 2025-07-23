'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/modal';
import { Download, Eye, ExternalLink, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';
import { useState } from 'react';

interface ResultPanelProps {
    screenshot?: string;
    fieldsProcessed?: number;
    totalFields?: number;
    url?: string;
    isVisible: boolean;
}

export function ResultPanel({ screenshot, fieldsProcessed = 0, totalFields = 0, url, isVisible }: ResultPanelProps) {
    const [showScreenshot, setShowScreenshot] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const handleDownloadScreenshot = () => {
        if (!screenshot) return;

        const link = document.createElement('a');
        link.href = `data:image/png;base64,${screenshot}`;
        link.download = `automation-result-${new Date().toISOString().split('T')[0]}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleOpenUrl = () => {
        if (url) {
            window.open(url, '_blank');
        }
    };

    const handleZoomIn = () => {
        setZoomLevel((prev) => Math.min(prev + 0.25, 3));
    };

    const handleZoomOut = () => {
        setZoomLevel((prev) => Math.max(prev - 0.25, 0.25));
    };

    const handleResetZoom = () => {
        setZoomLevel(1);
        setRotation(0);
    };

    const handleRotate = () => {
        setRotation((prev) => (prev + 90) % 360);
    };

    if (!isVisible) return null;

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">📊 Automation Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Statistics */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{fieldsProcessed}</div>
                        <div className="text-sm text-gray-600">Fields Processed</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{totalFields}</div>
                        <div className="text-sm text-gray-600">Total Fields</div>
                    </div>
                </div>

                {/* URL Info */}
                {url && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                            <div className="text-sm font-medium text-gray-700">Target URL</div>
                            <div className="text-sm text-gray-600 truncate">{url}</div>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleOpenUrl}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open
                        </Button>
                    </div>
                )}

                {/* Screenshot Section */}
                {screenshot && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium">Screenshot</h4>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setShowScreenshot(!showScreenshot)}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    {showScreenshot ? 'Hide' : 'Show'}
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleDownloadScreenshot}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                </Button>
                            </div>
                        </div>

                        {showScreenshot && screenshot && (
                            <div className="space-y-3">
                                {/* Zoom Controls */}
                                <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">
                                            Zoom: {Math.round(zoomLevel * 100)}%
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleZoomOut}
                                            disabled={zoomLevel <= 0.25}
                                        >
                                            <ZoomOut className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleZoomIn}
                                            disabled={zoomLevel >= 3}
                                        >
                                            <ZoomIn className="w-4 h-4" />
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={handleRotate}>
                                            <RotateCcw className="w-4 h-4" />
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={handleResetZoom}>
                                            Reset
                                        </Button>
                                    </div>
                                </div>

                                {/* Screenshot Container with Hover Effect */}
                                <div
                                    className="border rounded-lg overflow-auto bg-gray-100 relative group"
                                    style={{ maxHeight: '400px' }}
                                    onMouseEnter={() => setIsHovered(true)}
                                    onMouseLeave={() => setIsHovered(false)}
                                >
                                    <div
                                        className="flex items-center justify-center p-4"
                                        style={{
                                            transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                                            transformOrigin: 'center center',
                                            transition: 'transform 0.2s ease-in-out',
                                        }}
                                    >
                                        <img
                                            src={`data:image/png;base64,${screenshot}`}
                                            alt="Automation Result"
                                            className="max-w-full h-auto object-contain"
                                            onError={(e) => {
                                                console.error('Failed to load screenshot');
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    </div>

                                    {/* Hover Overlay with Zoom Button */}
                                    {isHovered && (
                                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        className="bg-white/90 hover:bg-white shadow-lg"
                                                    >
                                                        <Maximize2 className="w-4 h-4 mr-2" />
                                                        Full Screen
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-transparent border-none">
                                                    <DialogTitle className="sr-only">
                                                        Screenshot Full Screen View
                                                    </DialogTitle>
                                                    <div className="flex items-center justify-center w-full h-full">
                                                        <img
                                                            src={`data:image/png;base64,${screenshot}`}
                                                            alt="Automation Result - Full Screen"
                                                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                                                            style={{
                                                                transform: `rotate(${rotation}deg)`,
                                                                transition: 'transform 0.2s ease-in-out',
                                                            }}
                                                        />
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Browser Status */}
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                        <div className="text-sm font-medium text-gray-700">Browser Status</div>
                        <div className="text-sm text-gray-600">Remains open for manual inspection</div>
                    </div>
                    <Badge variant="default" className="bg-purple-600">
                        Active
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}
