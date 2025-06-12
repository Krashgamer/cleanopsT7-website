// src/components/ImageGallery.jsx

import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';
import 'swiper/css/effect-fade';
// Import required Swiper modules
import { Pagination, Navigation, Autoplay, EffectFade } from 'swiper/modules';

// Import the lightbox and its base styles
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

// Import our robust hook
import { useIsMobileOrTouch } from '../hooks/useIsMobileOrTouch';

const galleryImages = [
    `${import.meta.env.BASE_URL}img/gallery-1.jpg`,
    `${import.meta.env.BASE_URL}img/gallery-2.jpg`,
    `${import.meta.env.BASE_URL}img/gallery-3.jpg`,
    `${import.meta.env.BASE_URL}img/gallery-4.jpg`,
];

// Prepare slides for the lightbox
const lightboxSlides = galleryImages.map(src => ({ src }));

export default function ImageGallery() {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const isMobileExperience = useIsMobileOrTouch();

    const handleImageClick = (index) => {
        // Only open the lightbox on mobile/touch devices.
        if (!isMobileExperience) return;

        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    // This effect now robustly manages browser history for the lightbox.
    useEffect(() => {
        // This function handles the 'popstate' event (e.g., browser back button).
        const onPopState = () => {
            setLightboxOpen(false);
        };

        if (lightboxOpen) {
            // When the lightbox opens, push a new state to the history.
            window.history.pushState({ lightbox: "open" }, "");
            window.addEventListener('popstate', onPopState);
        }

        // The cleanup function runs when the component unmounts or `lightboxOpen` changes.
        return () => {
            window.removeEventListener('popstate', onPopState);
            // If the lightbox was closed via the 'X' button, the history state will
            // still be our lightbox state. We must go back to keep the history in sync.
            // This runs after React has removed the lightbox, avoiding the scroll jump.
            if (window.history.state?.lightbox === "open") {
                window.history.back();
            }
        };
    }, [lightboxOpen]);

    // This handler now directly updates the state. The `useEffect` handles the history.
    const handleLightboxClose = () => {
        setLightboxOpen(false);
    };

    return (
        <>
            <div className="w-full h-full grid place-items-center">
                <svg width="80%" height="80%" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet">
                    <foreignObject x="0" y="0" width="1600" height="900">
                        <div className="w-full h-full rounded-lg overflow-hidden border-2 border-gray-700/50 shadow-2xl">
                            <Swiper
                                className="mySwiper w-full h-full group"
                                modules={[Pagination, Navigation, Autoplay, EffectFade]}
                                navigation={!isMobileExperience}
                                pagination={{ clickable: true }}
                                effect="fade"
                                fadeEffect={{ crossFade: true }}
                                speed={1000}
                                loop={true}
                                autoplay={{ delay: 4000, disableOnInteraction: false }}
                            >
                                {galleryImages.map((src, index) => (
                                    <SwiperSlide
                                        key={index}
                                        // The cursor will only be a pointer on mobile, indicating interactivity.
                                        className={isMobileExperience ? 'cursor-pointer' : ''}
                                        onClick={() => handleImageClick(index)}
                                    >
                                        <img src={src} alt={`Clean Ops Gallery Image ${index + 1}`} className="w-full h-full object-cover select-none" />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>
                    </foreignObject>
                </svg>
            </div>

            {/* Conditionally render the Lightbox. It will only be included in the DOM on mobile devices. */}
            {isMobileExperience && (
                <Lightbox
                    open={lightboxOpen}
                    close={handleLightboxClose}
                    slides={lightboxSlides}
                    index={lightboxIndex}
                />
            )}
        </>
    );
}