/**
 * Standardizes product naming across the platform.
 * Prioritizes bracketed variant names (e.g., "(Red)") and strips internal identifiers like "testing".
 */
export const cleanProductName = (name = "") => {
    if (!name) return "Premium Product";
    
    // 1. If it has brackets like (Color), that's our primary name
    const bracketMatch = name.match(/\(([^)]+)\)/);
    if (bracketMatch) {
        return bracketMatch[1];
    }

    // 2. Otherwise, strip technical terms and return
    return name
        .replace(/\btesting\b/gi, "")
        .replace(/\bnull\b/gi, "")
        .replace(/\s+/g, " ")
        .trim() || name;
};

/**
 * Returns a fallback hex color for a given color name.
 */
export const getHexColor = (colorName = "") => {
    const COLOR_MAP = {
        black: '#1a1a1a', white: '#f5f5f5', red: '#e53935', blue: '#1e88e5',
        navy: '#1a237e', green: '#43a047', emerald: '#10b981', yellow: '#fdd835',
        orange: '#fb8c00', pink: '#e91e63', purple: '#8e24aa', grey: '#9e9e9e',
        gray: '#9e9e9e', brown: '#795548', beige: '#f5f0e8', maroon: '#880e4f',
        'sky blue': '#87ceeb', 'sky': '#87ceeb', 'dark cyan': '#008b8b',
        'tempered gray': '#808080', meroon: '#800000', cyan: '#00bcd4',
        teal: '#009688', indigo: '#3f51b5', violet: '#7c3aed', lime: '#cddc39',
        'light blue': '#90caf9', 'dark green': '#1b5e20', cream: '#fffdd0',
        mustard: '#ffdb58', lavender: '#e6e6fa', 'rose': '#f43f5e',
        'olive': '#556b2f', 'gold': '#ffd700', 'silver': '#c0c0c0',
        'peach': '#ffdab9', 'khaki': '#f0e68c', 'magenta': '#ff00ff'
    };
    
    if (!colorName) return '#d1d5db';
    
    const lower = colorName.toLowerCase().trim();
    // Support hex strings directly if they start with #
    if (lower.startsWith('#')) return lower;
    
    return COLOR_MAP[lower] || '#d1d5db';
};

/**
 * Premium default colors to show when no specific variant colors are found.
 * This makes the UI look "alive" and premium even for basic listings.
 */
export const DEFAULT_DISPLAY_COLORS = ['black', 'navy', 'maroon', 'white'];
