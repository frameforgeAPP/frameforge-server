export const themes = {
    custom: {
        name: "Personalizável",
        colors: {
            bg: "bg-[#111827]",
            text: "text-white",
            border: "border-gray-700",
            panelBg: "bg-[#1f2937]",
            accent: "text-blue-500",
            accentBg: "bg-blue-500",
            secondary: "text-purple-500",
            secondaryBg: "bg-purple-500",
            highlight: "text-orange-500",
            highlightBg: "bg-orange-500",
            success: "text-green-500",
            danger: "text-red-500",
            grid: "rgba(255,255,255,0.1)"
        }
    },
    default: {
        name: "Default",
        colors: {
            bg: "bg-[#0a0a0a]",
            text: "text-white",
            border: "border-gray-800",
            panelBg: "bg-gray-900",
            accent: "text-blue-500",
            accentBg: "bg-blue-500",
            secondary: "text-purple-400",
            secondaryBg: "bg-purple-500",
            highlight: "text-orange-400",
            highlightBg: "bg-orange-500",
            success: "text-green-400",
            danger: "text-red-500",
            grid: "rgba(255,255,255,0.1)"
        }
    },
    cyberpunk: {
        name: "Cyberpunk",
        colors: {
            bg: "bg-[#fcee0a]", // Vivid Yellow
            text: "text-black", // Black
            border: "border-black", // Black
            panelBg: "bg-[#e6d909]", // Slightly darker yellow
            accent: "text-black",
            accentBg: "bg-black",
            secondary: "text-black",
            secondaryBg: "bg-black",
            highlight: "text-black",
            highlightBg: "bg-black",
            success: "text-black",
            danger: "text-[#ff003c]", // Red for danger remains
            grid: "rgba(0, 0, 0, 0.15)" // Black Grid
        }
    },
    redDragon: {
        name: "Red Dragon",
        colors: {
            bg: "bg-[#0a0a0a]", // Black
            text: "text-[#ff0000]", // Red
            border: "border-[#800000]", // Dark Red
            panelBg: "bg-[#1a0505]", // Very Dark Red/Black
            accent: "text-[#ff0000]",
            accentBg: "bg-[#ff0000]",
            secondary: "text-[#cc0000]",
            secondaryBg: "bg-[#cc0000]",
            highlight: "text-[#ff3333]",
            highlightBg: "bg-[#ff3333]",
            success: "text-[#00ff00]",
            danger: "text-[#ff0000]",
            grid: "rgba(255, 0, 0, 0.15)"
        }
    },
    toxicGreen: {
        name: "Toxic Green",
        colors: {
            bg: "bg-[#0a0a0a]", // Black
            text: "text-[#39ff14]", // Neon Green
            border: "border-[#39ff14]",
            panelBg: "bg-[#051a05]", // Very Dark Green/Black
            accent: "text-[#39ff14]",
            accentBg: "bg-[#39ff14]",
            secondary: "text-[#32cd32]",
            secondaryBg: "bg-[#32cd32]",
            highlight: "text-[#98fb98]",
            highlightBg: "bg-[#98fb98]",
            success: "text-[#39ff14]",
            danger: "text-[#ff0000]",
            grid: "rgba(57, 255, 20, 0.15)"
        }
    },
    ice: {
        name: "Ice",
        colors: {
            bg: "bg-[#f0f8ff]", // Alice Blue (Very light)
            text: "text-[#00bfff]", // Deep Sky Blue
            border: "border-[#b0e0e6]", // Powder Blue
            panelBg: "bg-[#ffffff]", // White
            accent: "text-[#1e90ff]", // Dodger Blue
            accentBg: "bg-[#1e90ff]",
            secondary: "text-[#87ceeb]", // Sky Blue
            secondaryBg: "bg-[#87ceeb]",
            highlight: "text-[#4682b4]", // Steel Blue
            highlightBg: "bg-[#4682b4]",
            success: "text-[#32cd32]",
            danger: "text-[#ff4500]",
            grid: "rgba(0, 191, 255, 0.1)"
        }
    },
    military: {
        name: "Military",
        colors: {
            bg: "bg-[#1e211d]", // Dark Olive
            text: "text-[#aebfa3]", // Sage Green
            border: "border-[#4b5320]", // Army Green
            panelBg: "bg-[#2b3026]",
            accent: "text-[#d2b48c]", // Tan
            accentBg: "bg-[#d2b48c]",
            secondary: "text-[#8f9779]", // Artichoke
            secondaryBg: "bg-[#8f9779]",
            highlight: "text-[#f5f5dc]", // Beige
            highlightBg: "bg-[#f5f5dc]",
            success: "text-[#aebfa3]",
            danger: "text-[#8b0000]",
            grid: "rgba(174, 191, 163, 0.1)"
        }
    },
    scifi: {
        name: "Sci-Fi HUD",
        colors: {
            bg: "bg-[#020b14]", // Deep Navy
            text: "text-[#00ffff]", // Cyan
            border: "border-[#008b8b]", // Dark Cyan
            panelBg: "bg-[#051525]",
            accent: "text-[#00ffff]",
            accentBg: "bg-[#00ffff]",
            secondary: "text-[#00ced1]", // Dark Turquoise
            secondaryBg: "bg-[#00ced1]",
            highlight: "text-[#e0ffff]", // Light Cyan
            highlightBg: "bg-[#e0ffff]",
            success: "text-[#00ffff]",
            danger: "text-[#ff4500]",
            grid: "rgba(0, 255, 255, 0.15)"
        }
    },
    gold: {
        name: "Gold Prestige",
        colors: {
            bg: "bg-[#121212]", // Rich Black
            text: "text-[#ffd700]", // Gold
            border: "border-[#daa520]", // Goldenrod
            panelBg: "bg-[#1c1c1c]",
            accent: "text-[#ffd700]",
            accentBg: "bg-[#ffd700]",
            secondary: "text-[#b8860b]", // Dark Goldenrod
            secondaryBg: "bg-[#b8860b]",
            highlight: "text-[#fff8dc]", // Cornsilk
            highlightBg: "bg-[#fff8dc]",
            success: "text-[#ffd700]",
            danger: "text-[#cd5c5c]",
            grid: "rgba(255, 215, 0, 0.15)"
        }
    },
    kawaii: {
        name: "Kawaii",
        colors: {
            bg: "bg-[#fff0f5]", // Lavender Blush
            text: "text-[#ff69b4]", // Hot Pink
            border: "border-[#ffb6c1]", // Light Pink
            panelBg: "bg-[#ffffff]",
            accent: "text-[#87cefa]", // Light Sky Blue
            accentBg: "bg-[#87cefa]",
            secondary: "text-[#dda0dd]", // Plum
            secondaryBg: "bg-[#dda0dd]",
            highlight: "text-[#ff1493]", // Deep Pink
            highlightBg: "bg-[#ff1493]",
            success: "text-[#98fb98]",
            danger: "text-[#ff6347]",
            grid: "rgba(255, 105, 180, 0.15)"
        }
    },
    matrix: {
        name: "The Matrix",
        colors: {
            bg: "bg-black",
            text: "text-[#00ff41]", // Matrix Green
            border: "border-[#008f11]",
            panelBg: "bg-[#050505]",
            accent: "text-[#00ff41]",
            accentBg: "bg-[#00ff41]",
            secondary: "text-[#003b00]",
            secondaryBg: "bg-[#003b00]",
            highlight: "text-[#ccffcc]",
            highlightBg: "bg-[#ccffcc]",
            success: "text-[#00ff41]",
            danger: "text-[#ff0000]",
            grid: "rgba(0, 255, 65, 0.15)"
        }
    },
    synthwave: {
        name: "Synthwave",
        colors: {
            bg: "bg-[#1a0b2e]", // Deep Purple
            text: "text-[#ff71ce]", // Neon Pink
            border: "border-[#01cdfe]", // Neon Blue
            panelBg: "bg-[#2b1055]", // Lighter Purple
            accent: "text-[#05ffa1]", // Neon Green
            accentBg: "bg-[#05ffa1]",
            secondary: "text-[#b967ff]", // Purple
            secondaryBg: "bg-[#b967ff]",
            highlight: "text-[#fffb96]", // Yellow
            highlightBg: "bg-[#fffb96]",
            success: "text-[#05ffa1]",
            danger: "text-[#ff71ce]",
            grid: "rgba(185, 103, 255, 0.15)"
        }
    }
};
