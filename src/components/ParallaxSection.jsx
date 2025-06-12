// src/components/ParallaxSection.jsx

import React, { forwardRef, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// Use forwardRef to allow parent components to pass a ref to this component's <section> element
const ParallaxSection = forwardRef(({ imageUrl, children, className, gradientClass }, ref) => {
    const internalRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: internalRef,
        offset: ["start end", "end start"],
    });

    // A more conservative parallax effect to prevent visual issues
    const backgroundY = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);

    return (
        <section
            // Assign the forwarded ref here, and the internal ref for framer-motion
            ref={(node) => {
                internalRef.current = node;
                if (typeof ref === 'function') {
                    ref(node);
                } else if (ref) {
                    ref.current = node;
                }
            }}
            className={`relative h-screen overflow-hidden ${className || ''}`}
        >
            <motion.div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `url(${imageUrl})`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                    y: backgroundY,
                    // Use a smaller scale to prevent the background from being "too big"
                    // while still ensuring it covers the area during transformation.
                    scale: 1,
                }}
            />
            <div className={`absolute inset-0 z-10 ${gradientClass || 'bg-black/60'}`} />

            <div className="relative z-20 w-full h-full overflow-y-auto text-white">
                {/* This inner flexbox centers the content vertically. 
                    If content is taller than the viewport, `min-h-full` allows it to expand,
                    and the parent's `overflow-y-auto` creates a scrollbar. */}
                <div className="flex min-h-full w-full items-center justify-center">
                    <div className="w-full text-center">
                        {children}
                    </div>
                </div>
            </div>
        </section>
    );
});

export default ParallaxSection;
