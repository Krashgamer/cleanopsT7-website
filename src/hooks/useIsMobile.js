// src/hooks/useIsMobile.js
import { useState, useEffect } from 'react';

// This hook returns true if the screen width is below a given breakpoint.
// Default to 768px, which is a common tablet breakpoint.
export const useIsMobile = (breakpoint = 768) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup the event listener when the component unmounts
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [breakpoint]); // Re-run effect if the breakpoint changes

    return isMobile;
};