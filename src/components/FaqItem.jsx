import React, { useState, useRef } from 'react';

const FaqItem = ({ question, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const detailsRef = useRef(null);

  const handleClick = (e) => {
    // If the click target or one of its parents is a link, we let the browser
    // handle the navigation and do not interfere.
    if (e.target.closest('a')) {
      return;
    }

    // For any other click, we take control. We prevent the default browser
    // behavior for the <details> element. This is key to stopping the
    // accordion from toggling when the user is selecting text in the summary.
    e.preventDefault();

    // Now, we check if the user was trying to select text. If they were,
    // the selection will not be empty. In this case, we do nothing further,
    // allowing them to copy text without toggling the accordion state.
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      return;
    }

    // If it was a genuine click (not a text selection or a link), toggle our state.
    // The redundant DOM manipulation has been removed as `open={isOpen}` handles this reactively.
    setIsOpen(!isOpen);
  };

  return (
    <details
      ref={detailsRef}
      className="bg-dark-secondary/70 backdrop-blur-sm rounded-lg border border-gray-700/50 transition-colors hover:border-brand-purple group cursor-pointer"
      onClick={handleClick}
      open={isOpen}
    >
      <summary className="font-bold text-lg text-white list-none flex justify-between items-center p-6 block w-full group-hover:border-brand-purple">
        {question}
        <span className="text-brand-purple transform transition-transform duration-300 details-arrow">▾</span>
      </summary>
      <div className="px-6 pb-6 text-gray-300 prose prose-invert max-w-none">
        {children}
      </div>
    </details>
  );
};

export default FaqItem;
