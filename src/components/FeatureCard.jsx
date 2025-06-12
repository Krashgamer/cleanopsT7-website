import React from 'react';
import { motion } from 'framer-motion';

const FeatureCard = ({ icon, title, description }) => (
    <motion.div
        className="bg-dark-secondary/70 backdrop-blur-sm p-6 rounded-lg border border-gray-700/50 transition-all duration-300 hover:border-brand-purple hover:-translate-y-1 shadow-lg min-w-[280px] h-full"
    >
        <div className="text-brand-purple mb-4 text-4xl">{icon}</div>
        <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
        <p className="text-gray-300">{description}</p>
    </motion.div>
);

export default FeatureCard;
