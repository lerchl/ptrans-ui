import clsx from "clsx";

interface IColorPickerProps {
    label?: string;
    value: string;
    onChange: (hex: string) => void;
}

export const ColorPicker = ({ label, value, onChange }: IColorPickerProps) => {

    const presets = [
        // Reds & oranges
        "#ff0000", "#ff4444", "#ff6b35", "#ff8c00",
        // Yellows & amber
        "#ffff00", "#ffe033", "#ffcc00", "#ffa500",
        // Greens
        "#00ff00", "#39ff14", "#7fff00", "#00e676",
        // Teals & cyans
        "#00ffff", "#00e5cc", "#1de9b6", "#64ffda",
        // Blues & purples
        "#4fc3f7", "#448aff", "#b388ff", "#e040fb",
        // Neons
        "#ff1744", "#ff9100", "#c6ff00", "#00e5ff",
        // Pastels
        "#ffb3ba", "#ffdfba", "#ffffba", "#baffc9",
        // Off-whites & neutrals
        "#ffffff", "#f5f5dc", "#fffde7", "#e8eaf6",
        // Purples & pinks
        "#ce93d8", "#9c27b0", "#ff80ab", "#f48fb1",
        // Good defaults
        "#ff6f00", "#aed581", "#80cbc4", "#90caf9",
    ];

    return (
        <div className="space-y-2">
            {label && <p className="text-sm font-bold">{label}</p>}

            {/* Preset swatches */}
            <div className="grid grid-cols-8 gap-1">
                {presets.map(color => (
                    <button
                        key={color}
                        title={color}
                        onClick={() => onChange(color)}
                        style={{ backgroundColor: color }}
                        className={clsx(
                            "w-6 h-6 border",
                            value === color
                                ? "border-t-[#404040] border-l-[#404040] border-r-white border-b-white"
                                : "border-t-white border-l-white border-r-[#404040] border-b-[#404040]"
                        )}
                    />
                ))}
            </div>

            {/* Custom hex input + native picker */}
            <div className="flex items-center gap-2">
                <input
                    type="color"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="w-8 h-7 border border-t-[#404040] border-l-[#404040] border-r-white border-b-white bg-white cursor-pointer p-0"
                />
                <input
                    type="text"
                    value={value}
                    maxLength={7}
                    onChange={e => {
                        const v = e.target.value;
                        if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v);
                    }}
                    className="win98-input"
                />
            </div>

            {/* Preview swatch */}
            <div className="flex items-center gap-2">
                <div
                    style={{ backgroundColor: value }}
                    className="w-full h-6 border border-t-[#404040] border-l-[#404040] border-r-white border-b-white"
                />
            </div>
        </div>
    );
};
