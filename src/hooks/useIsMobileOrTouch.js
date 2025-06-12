// src/hooks/useIsMobileOrTouch.js
import { useState, useEffect } from 'react';

const checkIsMobileOrTouch = (breakpoint = 768) => {
    // Guard for server-side rendering
    if (typeof window === 'undefined') {
        return false;
    }

    // Check for actual touch capability (reliable on real devices)
    const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    // Check for small screen width (reliable for DevTools emulation)
    const isSmallScreen = window.innerWidth < breakpoint;

    return hasTouch || isSmallScreen;
};

// This hook returns true if it's a touch device OR the screen is narrow
export const useIsMobileOrTouch = () => {
    // Initialize state with the current value
    const [isMobile, setIsMobile] = useState(checkIsMobileOrTouch());

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(checkIsMobileOrTouch());
        };

        window.addEventListener('resize', handleResize);

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []); // Empty dependency array ensures this runs only on mount/unmount

    return isMobile;
};