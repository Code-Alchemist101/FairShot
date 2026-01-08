'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function GlobalProctoringCleanup() {
    const pathname = usePathname();

    useEffect(() => {
        // If we are NOT on an assessment page, ensure WebGazer is killed
        if (pathname && !pathname.startsWith('/assessment')) {
            const cleanupWebGazer = async () => {
                try {
                    // Check if webgazer is loaded globally
                    if ((window as any).webgazer) {
                        console.log('🧹 Global Cleanup: Stopping background WebGazer instance...');
                        (window as any).webgazer.end();

                        // Force remove the video container if it persists
                        const videoContainer = document.getElementById('webgazerVideoContainer');
                        if (videoContainer) {
                            videoContainer.remove();
                        }
                    }
                } catch (error) {
                    // Ignore errors if webgazer isn't there
                }
            };

            cleanupWebGazer();
        }
    }, [pathname]);

    return null;
}
