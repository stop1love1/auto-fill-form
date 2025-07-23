'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/modal';
import { Download, Eye, ExternalLink, ZoomIn, ZoomOut, RotateCcw, Maximize2, Activity, Globe } from 'lucide-react';
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
        <Card className="h-full">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-600" />
                        <CardTitle className="text-base">Activity & Results</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-xs">
                        {fieldsProcessed}/{totalFields} Fields
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Compact Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-blue-600">{fieldsProcessed}</div>
                        <div className="text-xs text-gray-600">Processed</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-green-600">{totalFields}</div>
                        <div className="text-xs text-gray-600">Total</div>
                    </div>
                </div>

                {/* URL Info - Compact */}
                {url && (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <Globe className="w-3 h-3 text-gray-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <div className="text-xs text-gray-600 truncate">{url}</div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleOpenUrl} className="h-6 px-2">
                            <ExternalLink className="w-3 h-3" />
                        </Button>
                    </div>
                )}

                {/* Screenshot Section - Compact */}
                {screenshot && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Screenshot</span>
                            <div className="flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowScreenshot(!showScreenshot)}
                                    className="h-6 px-2"
                                >
                                    <Eye className="w-3 h-3 mr-1" />
                                    {showScreenshot ? 'Hide' : 'Show'}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleDownloadScreenshot}
                                    className="h-6 px-2"
                                >
                                    <Download className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>

                        {showScreenshot && screenshot && (
                            <div className="space-y-2">
                                {/* Compact Zoom Controls */}
                                <div className="flex items-center justify-between bg-gray-50 p-2 rounded text-xs">
                                    <span className="text-gray-600">{Math.round(zoomLevel * 100)}%</span>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleZoomOut}
                                            disabled={zoomLevel <= 0.25}
                                            className="h-6 w-6 p-0"
                                        >
                                            <ZoomOut className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleZoomIn}
                                            disabled={zoomLevel >= 3}
                                            className="h-6 w-6 p-0"
                                        >
                                            <ZoomIn className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleRotate}
                                            className="h-6 w-6 p-0"
                                        >
                                            <RotateCcw className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleResetZoom}
                                            className="h-6 px-2 text-xs"
                                        >
                                            Reset
                                        </Button>
                                    </div>
                                </div>

                                {/* Screenshot Container */}
                                <div
                                    className="border rounded-lg overflow-auto bg-gray-100 relative group"
                                    style={{ maxHeight: '300px' }}
                                    onMouseEnter={() => setIsHovered(true)}
                                    onMouseLeave={() => setIsHovered(false)}
                                >
                                    <div
                                        className="flex items-center justify-center p-3"
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

                                    {/* Hover Overlay */}
                                    {isHovered && (
                                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        className="bg-white/90 hover:bg-white shadow-lg h-7"
                                                    >
                                                        <Maximize2 className="w-3 h-3 mr-1" />
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

                {/* Status Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-gray-600">Browser Active</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
