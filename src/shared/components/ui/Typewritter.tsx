import { useState, useEffect } from "react";

interface TypewriterProps {
    text: string;
    delay?: number;
    onComplete?: () => void;
    className?: string;
}

export default function Typewriter({
    text,
    delay = 50,
    onComplete,
    className = ""
}: TypewriterProps) {
    const [displayedText, setDisplayedText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        // Reset when text changes completely
        setDisplayedText("");
        setCurrentIndex(0);
        setIsComplete(false);
    }, [text]);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText((prev) => prev + text[currentIndex]);
                setCurrentIndex((prev) => prev + 1);
            }, delay);

            return () => clearTimeout(timeout);
        } else if (!isComplete) {
            setIsComplete(true);
            onComplete?.();
        }
    }, [currentIndex, delay, text, onComplete, isComplete]);

    return <span className={className}>{displayedText}</span>;
}