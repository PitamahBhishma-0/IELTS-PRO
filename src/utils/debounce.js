/**
 * Debounce utility function
 * Delays function execution until after a specified delay has passed
 * since the last invocation
 *
 * @param {Function} func - The function to debounce
 * @param {number} delay - The delay in milliseconds
 * @returns {Function} - The debounced function
 */
export function debounce(func, delay = 300) {
    let timeoutId;

    return function debounced(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

/**
 * Throttle utility function
 * Limits function execution to at most once every specified delay
 *
 * @param {Function} func - The function to throttle
 * @param {number} delay - The delay in milliseconds
 * @returns {Function} - The throttled function
 */
export function throttle(func, delay = 300) {
    let lastCall = 0;
    let timeoutId = null;

    return function throttled(...args) {
        const now = Date.now();
        const timeSinceLastCall = now - lastCall;

        if (timeSinceLastCall >= delay) {
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
            lastCall = now;
            func.apply(this, args);
        } else if (!timeoutId) {
            timeoutId = setTimeout(() => {
                lastCall = Date.now();
                timeoutId = null;
                func.apply(this, args);
            }, delay - timeSinceLastCall);
        }
    };
}
