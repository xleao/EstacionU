import { useEffect, useState, useRef } from 'react';

const useIntersectionObserver = (options = {}) => {
    const elementRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                if (options.triggerOnce) {
                    // Try/catch for safety if element already unmounted
                    try {
                        observer.unobserve(entry.target);
                    } catch (e) {
                        // ignore
                    }
                }
            } else if (!options.triggerOnce) {
                setIsVisible(false);
            }
        }, { threshold: 0.1, ...options });

        const currentElement = elementRef.current;
        if (currentElement) {
            observer.observe(currentElement);
        }

        return () => {
            if (currentElement) {
                observer.unobserve(currentElement);
            }
        };
    }, [options.triggerOnce, options.threshold, options.rootMargin]);

    return [elementRef, isVisible];
};

export default useIntersectionObserver;
