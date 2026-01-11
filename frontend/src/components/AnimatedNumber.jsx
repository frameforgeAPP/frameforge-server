import React, { useState, useEffect } from 'react';

const AnimatedNumber = ({ value, duration = 500, format = (v) => Math.round(v) }) => {
    const [displayValue, setDisplayValue] = useState(value);

    useEffect(() => {
        let startTime;
        const startValue = displayValue;
        const endValue = value;

        if (startValue === endValue) return;

        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            // Ease out cubic
            const ease = 1 - Math.pow(1 - progress, 3);

            const current = startValue + (endValue - startValue) * ease;
            setDisplayValue(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [value, duration]);

    return <>{format(displayValue)}</>;
};

export default AnimatedNumber;
