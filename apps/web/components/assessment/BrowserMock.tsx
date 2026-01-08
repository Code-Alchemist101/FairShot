'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Globe, AlertCircle } from 'lucide-react';

interface BrowserMockProps {
    initialUrl?: string;
}

const ALLOWED_DOMAINS = [
    'https://www.w3schools.com',
    'https://docs.python.org',
    'https://www.geeksforgeeks.org',
];

export function BrowserMock({ initialUrl = 'https://www.w3schools.com' }: BrowserMockProps) {
    const [url, setUrl] = useState(initialUrl);
    const [inputUrl, setInputUrl] = useState(initialUrl);
    const [error, setError] = useState('');

    const validateUrl = (urlString: string): boolean => {
        let fullUrl = urlString.trim();
        if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
            fullUrl = 'https://' + fullUrl;
        }

        // Check if URL contains any allowed domain
        const isAllowed = ALLOWED_DOMAINS.some((domain) => {
            const domainName = domain.replace('https://', '').replace('http://', '');
            return fullUrl.includes(domainName);
        });

        if (!isAllowed) {
            setError(`Access denied. Only these sites are allowed: ${ALLOWED_DOMAINS.join(', ')}`);
            return false;
        }

        setError('');
        return true;
    };

    const handleNavigate = () => {
        if (validateUrl(inputUrl)) {
            let fullUrl = inputUrl;
            if (!inputUrl.startsWith('http://') && !inputUrl.startsWith('https://')) {
                fullUrl = 'https://' + inputUrl;
            }
            setUrl(fullUrl);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleNavigate();
        }
    };

    return (
        <div className="h-full w-full flex flex-col bg-slate-900 rounded-lg overflow-hidden">
            <div className="bg-slate-800 p-2 border-b border-slate-700">
                <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-400" />
                    <Input
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter URL..."
                        className="flex-1 h-8 text-sm bg-slate-700 border-slate-600"
                    />
                    <Button onClick={handleNavigate} size="sm" variant="secondary">
                        Go
                    </Button>
                </div>
                {error && (
                    <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">{error}</AlertDescription>
                    </Alert>
                )}
            </div>

            <div className="flex-1 bg-white">
                <iframe
                    src={url}
                    sandbox="allow-scripts allow-same-origin"
                    className="w-full h-full border-0"
                    title="Allowed Browser"
                />
            </div>
        </div>
    );
}
