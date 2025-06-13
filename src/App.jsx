// src/App.jsx

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'; // Import Routes, Route, Navigate, useLocation, useNavigate
import { FaShieldAlt, FaTachometerAlt, FaBug, FaUsers, FaServer, FaFlag, FaDesktop, FaExclamationTriangle, FaDiscord, FaGithub } from 'react-icons/fa';
import { marked } from 'marked'; // Import marked

// Import all our organized components
import ParallaxSection from './components/ParallaxSection';
import ImageGallery from './components/ImageGallery';
import FeatureCard from './components/FeatureCard';
import FaqItem from './components/FaqItem';

const FAQ_URL = "https://raw.githubusercontent.com/wiki/notnightwolf/cleanopsT7/Frequently-Asked-Questions.md";

const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

// Define feature data outside the component to prevent re-creation on renders
const featuresData = [
    { icon: <FaShieldAlt />, title: "Enhanced Security", description: "Comprehensive anti-cheat and privacy features protect you from cheaters and malicious attacks." },
    { icon: <FaExclamationTriangle />, title: "IP-Spoofing", description: "Mask your IP address from other players to prevent targeted DoS attacks." },
    { icon: <FaUsers />, title: "Automatic Cheater Removal", description: "Automatically disconnects identified cheaters from your lobby using a live database." },
    { icon: <FaTachometerAlt />, title: "Performance Fixes", description: "Optimizes frame rates by disabling constant Steam DLC checks." },
    { icon: <FaServer />, title: "Server Browser", description: "Find and join active servers directly in-game with filters for region and player count." },
    { icon: <FaBug />, title: "Exploit Patching", description: "Fixes critical game-crashing exploits and prevents unfair advantages." },
    { icon: <FaFlag />, title: "Integrated Report System", description: "Report suspected cheaters directly through the Clean Ops UI for moderator review." },
    { icon: <FaDesktop />, title: "Full In-Game UI", description: "Access all features through a clean, intuitive interface via a single hotkey." }
];


function App() {
    // Create refs for the sections we want to snap to
    const heroRef = useRef(null);
    const featuresRef = useRef(null);
    const galleryRef = useRef(null);
    const featuresContainerRef = useRef(null); // Ref for the features scroll container

    // State for FAQs
    const [faqs, setFaqs] = useState([]);
    const [disclaimerHtml, setDisclaimerHtml] = useState('');
    const [loadingFaqs, setLoadingFaqs] = useState(true);
    const [faqError, setFaqError] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();

    // Effect to handle GitHub Pages redirect with clean URLs
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const path = params.get('p');
        if (path) {
            const decodedPath = decodeURIComponent(path);
            // Remove the 'p' parameter and navigate to the clean path
            // The 'replace: true' ensures it replaces the current history entry
            navigate(decodedPath, { replace: true });
        }
    }, [location.search, navigate]); // 'navigate' is a dependency as it's used inside the effect

    // Effect to fetch and parse FAQs
    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                setLoadingFaqs(true);
                setFaqError(null);
                const response = await fetch(FAQ_URL);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const markdownContent = await response.text();

                // Convert the entire Markdown document to HTML
                let fullHtml = marked.parse(markdownContent, { gfm: true });

                // Add target="_blank" to all links within the parsed HTML
                fullHtml = fullHtml.replace(/<a href/g, '<a target="_blank" rel="noopener noreferrer" href');

                // Use DOMParser to create a navigable DOM from the HTML string
                const parser = new DOMParser();
                const doc = parser.parseFromString(fullHtml, 'text/html');

                const parsedFaqs = [];
                // Find all h2 elements, which represent FAQ questions
                const headings = doc.querySelectorAll('h2');

                headings.forEach(heading => {
                    const question = heading.textContent.replace(/^\d+\.\s*/, '').trim(); // Clean up question text
                    let answerHtml = '';
                    let nextElement = heading.nextElementSibling;

                    // Collect all sibling elements until the next h2, hr, or the end
                    while (nextElement && nextElement.tagName !== 'H2' && nextElement.tagName !== 'HR') {
                        answerHtml += nextElement.outerHTML;
                        nextElement = nextElement.nextElementSibling;
                    }

                    if (question && answerHtml) {
                        parsedFaqs.push({
                            question: question,
                            answer: answerHtml
                        });
                    }
                });

                // Find and set the disclaimer HTML
                const allParagraphs = doc.querySelectorAll('p');
                const disclaimerParagraph = Array.from(allParagraphs).find(p => p.textContent.includes('If your issue is not covered here'));
                if (disclaimerParagraph) {
                    setDisclaimerHtml(disclaimerParagraph.innerHTML);
                }

                setFaqs(parsedFaqs);
            } catch (error) {
                console.error("Failed to fetch or parse FAQs:", error);
                setFaqError("Failed to load FAQs. Please try again later.");
            } finally {
                setLoadingFaqs(false);
            }
        };

        fetchFaqs();
    }, []); // Empty dependency array ensures this runs only once

    // This effect implements a custom scroll-snapping behavior that feels more natural.
    useEffect(() => {
        let scrollTimeout;

        const onScroll = () => {
            // Clear any previously scheduled snap action
            clearTimeout(scrollTimeout);

            const sections = [heroRef.current, featuresRef.current, galleryRef.current].filter(Boolean);
            if (!sections.length) return;

            const viewportCenter = window.scrollY + window.innerHeight / 2;
            let closestSection = null;
            let smallestDistance = Infinity;

            // Find the section whose center is closest to the viewport's center
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionCenter = sectionTop + section.offsetHeight / 2;
                const distance = Math.abs(viewportCenter - sectionCenter);

                if (distance < smallestDistance) {
                    smallestDistance = distance;
                    closestSection = section;
                }
            });

            // Define a "snap zone" (50% of the viewport height). Snapping only occurs inside this zone.
            const snapThreshold = window.innerHeight * 0.5;

            if (closestSection && smallestDistance < snapThreshold) {
                // DYNAMIC TIMEOUT: Wait longer to snap if the user is further from the center.
                const minTimeout = 100; // ms, for when user stops very close to the snap point
                const maxTimeout = 800; // ms, for when user stops near the edge of the snap zone
                const normalizedDistance = smallestDistance / snapThreshold;
                const dynamicTimeout = minTimeout + (normalizedDistance * (maxTimeout - minTimeout));

                // Schedule the snap action
                scrollTimeout = setTimeout(() => {
                    if (closestSection === galleryRef.current && window.scrollY > closestSection.offsetTop + 10) {
                        return; // Do not snap.
                    }
                    window.scrollTo({
                        top: closestSection.offsetTop,
                        behavior: 'smooth'
                    });
                }, dynamicTimeout);
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            clearTimeout(scrollTimeout);
            window.removeEventListener('scroll', onScroll);
        };
    }, []); // Empty dependency array ensures this runs only once

    // Click handler to center a feature card when in the scrollable view.
    const handleFeatureCardClick = (event) => {
        const cardElement = event.currentTarget;
        const containerElement = featuresContainerRef.current;

        if (!cardElement || !containerElement) return;

        // This interaction is only for the scrollable view.
        // A simple way to check is if the container's scrollWidth is larger than its clientWidth.
        const isScrollable = containerElement.scrollWidth > containerElement.clientWidth;
        if (!isScrollable) {
            return; // Do nothing in grid view
        }

        // Calculate the necessary scroll amount to center the clicked card.
        const cardRect = cardElement.getBoundingClientRect();
        const containerRect = containerElement.getBoundingClientRect();

        const scrollAmount = (cardRect.left + cardRect.width / 2) - (containerRect.left + containerRect.width / 2);

        containerElement.scrollBy({
            left: scrollAmount,
            behavior: 'smooth',
        });
    };

    // Handler for smooth scrolling without changing the URL hash.
    // This prevents the browser's default anchor link behavior and manually
    // scrolls to the target section for a cleaner user experience.
    const handleSmoothScroll = (event, targetId) => {
        event.preventDefault();
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop,
                behavior: 'smooth'
            });
        }
    };

    return (
        <Routes>
            <Route path="/" element={
                <div className="bg-dark-primary">

                    {/* ============== HERO SECTION (PARALLAX) ============== */}
                    <ParallaxSection ref={heroRef} imageUrl={`${import.meta.env.BASE_URL}img/bg-hero.jpg`} gradientClass="bg-black/40">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="container mx-auto px-4"
                        >
                            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4">
                                <span className="text-4xl md:text-6xl font-bold">Enhance Your <span className="bg-gradient-to-b from-yellow-300 to-orange-700 text-transparent bg-clip-text whitespace-nowrap">Black Ops 3</span> Experience</span>
                                <br />
                                <span className="mt-8
                                 block">
                                    <span className="text-gray-400 text-4xl md:text-6xl font-bold mr-2">—</span>
                                    <span className="bg-gradient-to-b from-purple-400 to-purple-600 text-transparent bg-clip-text whitespace-nowrap">Clean Ops</span>
                                </span>
                            </h1>
                            <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-8 mt-16">
                                <span className="font-bold">Clean Ops</span> is the essential community patch for PC, trying to deliver a safer, smoother, and cheat-free Black Ops 3 Multiplayer.
                            </p>
                            <a
                                href="#install"
                                onClick={(e) => handleSmoothScroll(e, '#install')}
                                className="inline-block bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold py-4 px-10 rounded-full text-lg transition-transform duration-300 ease-in-out hover:scale-105 cursor-pointer"
                            >
                                Download Now
                            </a>
                        </motion.div>
                    </ParallaxSection>

                    {/* ============== DETAILED FEATURES SECTION (PARALLAX) ============== */}
                    <ParallaxSection ref={featuresRef} imageUrl={`${import.meta.env.BASE_URL}img/bg-features.jpg`} gradientClass="bg-black/60">
                        <div className="container mx-auto px-6 py-12 md:py-24">
                            <motion.h2
                                className="text-4xl font-bold text-center mb-12 md:mb-16"
                                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
                            >
                                Powerful Features, Cleaner Gameplay
                            </motion.h2>
                            <motion.div
                                ref={featuresContainerRef}
                                className="flex overflow-x-auto flex-nowrap gap-8 pb-4 snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 h-scroll-features overflow-y-hidden pt-1"
                                initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
                                variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                            >
                                {featuresData.map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        className="flex-shrink-0 w-72 snap-center md:w-auto"
                                        variants={fadeIn}
                                        onClick={handleFeatureCardClick}
                                    >
                                        <FeatureCard
                                            icon={feature.icon}
                                            title={feature.title}
                                            description={feature.description}
                                        />
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </ParallaxSection>

                    {/* ============== GALLERY SECTION (PARALLAX) ============== */}
                    <ParallaxSection
                        ref={galleryRef}
                        imageUrl={`${import.meta.env.BASE_URL}img/bg-gallery.jpg`}
                        gradientClass="bg-black/40"
                        className="flex flex-col p-4 sm:p-6 md:p-8"
                    >
                        <motion.h2
                            className="text-3xl lg:text-4xl font-bold text-center mb-4 lg:mb-6 flex-shrink-0"
                            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
                        >
                            See It In Action
                        </motion.h2>
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                            variants={fadeIn}
                            className="flex-grow min-h-0"
                        >
                            <ImageGallery />
                        </motion.div>
                    </ParallaxSection>

                    {/* ============== HOW TO INSTALL SECTION ============== */}
                    <section id="install" className="py-24 bg-dark-primary">
                        <div className="container mx-auto px-6">
                            <motion.h2
                                className="text-4xl font-bold text-center mb-16"
                                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
                            >
                                How to Install Clean Ops
                            </motion.h2>
                            <motion.div
                                className="max-w-3xl mx-auto text-lg text-gray-300 space-y-6"
                                initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeIn}
                            >
                                <p>Installing Clean Ops is quick and easy. Follow the steps below or watch our video guide to get started:</p>
                                <ol className="list-decimal list-inside space-y-2 pl-4">
                                    <li>Download the <code className="bg-gray-700 px-1 rounded">cleanopsT7.exe</code> from <a href="https://github.com/notnightwolf/cleanopsT7/releases/download/1.1/cleanopsT7.exe" className="text-brand-purple hover:underline" target="_blank" rel="noopener noreferrer">here</a>.</li>
                                    <li>Move the <code className="bg-gray-700 px-1 rounded">.exe</code> into your Black Ops 3 directory (usually located in <code className="bg-gray-700 px-1 rounded break-all">C:\Program Files (x86)\Steam\steamapps\common\Call of Duty Black Ops III</code>).</li>
                                    <li>Create a shortcut on your desktop for easy access.</li>
                                    <li>Execute your created shortcut (You will not have to manually start the game).</li>
                                </ol>
                                <p>If you encounter any issues, please check the <a href="#faq" onClick={(e) => handleSmoothScroll(e, '#faq')} className="text-brand-purple hover:underline cursor-pointer">FAQ section</a> or join our <a href="https://discord.gg/exUnsW2eaa" target="_blank" rel="noopener noreferrer" className="text-brand-purple hover:underline">Discord server</a> for support.</p>
                            </motion.div>

                            {/* YouTube Embed */}
                            <motion.div
                                className="mt-16 aspect-video max-w-3xl mx-auto overflow-hidden rounded-lg shadow-2xl border-2 border-gray-700/50"
                                initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeIn}
                            >
                                <iframe
                                    className="w-full h-full"
                                    src="https://www.youtube.com/embed/HG48sOwyCQk"
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    allowFullScreen
                                ></iframe>
                            </motion.div>
                        </div>
                    </section>

                    {/* ============== FAQ SECTION ============== */}
                    <section id="faq" className="py-24 bg-dark-secondary">
                        <div className="container mx-auto px-6 max-w-4xl">
                            <motion.h2
                                className="text-4xl font-bold text-center mb-16"
                                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
                            >
                                Frequently Asked Questions
                            </motion.h2>
                            {/* A wrapper to manage content state and prevent layout shifts on load */}
                            <div className="min-h-[10rem]">
                                {loadingFaqs ? (
                                    <p className="text-center text-gray-400">Loading FAQs...</p>
                                ) : faqError ? (
                                    <p className="text-center text-red-500">{faqError}</p>
                                ) : (
                                    // Use a React Fragment to group content without an extra DOM element
                                    <>
                                        {faqs.length > 0 ? (
                                            <motion.div
                                                className="space-y-4"
                                                initial="hidden"
                                                whileInView="visible"
                                                viewport={{ once: true, amount: 0.1 }}
                                                variants={{
                                                    visible: { transition: { staggerChildren: 0.1 } }
                                                }}
                                            >
                                                {faqs.map((faq, index) => (
                                                    <motion.div key={index} variants={fadeIn}>
                                                        <FaqItem question={faq.question}>
                                                            <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                                                        </FaqItem>
                                                    </motion.div>
                                                ))}
                                            </motion.div>
                                        ) : (
                                            <p className="text-center text-gray-400">No FAQs found.</p>
                                        )}

                                        {disclaimerHtml && (
                                            <motion.p
                                                className="text-center text-gray-400 mt-8 prose prose-invert max-w-none"
                                                dangerouslySetInnerHTML={{ __html: disclaimerHtml }}
                                                initial="hidden"
                                                whileInView="visible"
                                                viewport={{ once: true, amount: 0.8 }}
                                                variants={fadeIn}
                                            />
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* ============== COMMUNITY & FOOTER ============== */}
                    <footer className="bg-dark-primary border-t border-gray-800">
                        <section id="community" className="py-20 text-center container mx-auto px-6">
                            <h2 className="text-3xl font-bold mb-6">Join the Community & Get Support</h2>
                            <p className="mb-8 max-w-2xl mx-auto text-gray-300">Connect with players, report bugs, or appeal a ban on our official channels.</p>
                            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                                <a href="https://discord.gg/exUnsW2eaa" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 w-full sm:w-auto justify-center">
                                    <FaDiscord size={24} /> Join our Discord
                                </a>
                                <a href="https://github.com/notnightwolf/cleanopsT7" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 w-full sm:w-auto justify-center">
                                    <FaGithub size={24} /> View on GitHub
                                </a>
                            </div>
                        </section>

                        <div className="py-10 text-center text-sm text-gray-500 border-t border-gray-800/50">
                            <div className="mb-4 flex flex-wrap justify-center gap-x-6 gap-y-2">
                                <a href={`${import.meta.env.BASE_URL}documents/gdpr.html`} target="_blank" rel="noopener noreferrer" className="hover:underline text-gray-400">GDPR Policy</a>
                                <a href={`${import.meta.env.BASE_URL}documents/privacy-by-design.html`} target="_blank" rel="noopener noreferrer" className="hover:underline text-gray-400">Privacy by Design</a>
                                <a href={`${import.meta.env.BASE_URL}documents/tos.html`} target="_blank" rel="noopener noreferrer" className="hover:underline text-gray-400">Terms of Service</a>
                            </div>
                            <p className="font-bold mb-2">UNOFFICIAL COMMUNITY PROJECT</p>
                            <p>Clean Ops is a community-developed patch and is not affiliated with, endorsed, or sponsored by Activision Publishing, Inc., Treyarch, or any of their affiliates or subsidiaries.</p>
                        </div>
                    </footer>
                </div>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
