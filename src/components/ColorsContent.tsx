import { useState } from "react";
import type { ColorDto, ColorsDto } from "../model";
import { ColorPicker } from "./ColorPicker";

interface IColorsContentProps {
    colors: undefined | ColorsDto;
    patchColors: (colors: ColorsDto) => Promise<void>;
};

const hexToRgb = (hex: string) => ({
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
});

const rgbToHex = (color: ColorDto) =>
    "#" + [color.r, color.g, color.b].map(v => v.toString(16).padStart(2, "0")).join("");

export const ColorsContent = ({ colors, patchColors }: IColorsContentProps) => {
    type ColorKey = "default" | "punctual" | "late" | "traffic";

    const black: ColorDto = { r: 0, g: 0, b: 0 };

    const [selected, setSelected] = useState<ColorKey>("default");
    const [edits, setEdits] = useState<Partial<Record<ColorKey, string>>>({});

    const colorLabels: Record<ColorKey, string> = {
        default: "Default foreground",
        punctual: "Punctual foreground",
        late: "Late foreground",
        traffic: "Traffic jam foreground",
    };

    const resolved: Record<ColorKey, string> = {
        default: edits.default ?? rgbToHex(colors?.fgDefault ?? black),
        punctual: edits.punctual ?? rgbToHex(colors?.fgPunctual ?? black),
        late: edits.late ?? rgbToHex(colors?.fgLate ?? black),
        traffic: edits.traffic ?? rgbToHex(colors?.fgTraffic ?? black),
    };

    const setColor = (value: string) =>
        setEdits(prev => ({ ...prev, [selected]: value }));

    return (
        <div className="space-y-3" style={{ minWidth: "220px" }}>
            <div className="border border-black bg-[#c0c0c0] p-2 space-y-1">
                {(Object.keys(colorLabels) as ColorKey[]).map(key => (
                    <label key={key} className="flex items-center gap-2 text-sm cursor-pointer select-none">
                        <input
                            type="radio"
                            name="colorTarget"
                            checked={selected === key}
                            onChange={() => setSelected(key)}
                            className="accent-[#000080]"
                        />
                        <span
                            style={{ backgroundColor: resolved[key] }}
                            className="inline-block w-4 h-4 border border-t-[#404040] border-l-[#404040] border-r-white border-b-white flex-shrink-0"
                        />
                        {colorLabels[key]}
                    </label>
                ))}
            </div>
            <ColorPicker value={resolved[selected]} onChange={setColor} />
            <div className="text-right">
                <button className="win98-btn" onClick={() =>
                    patchColors({
                        fgDefault: hexToRgb(resolved.default),
                        fgPunctual: hexToRgb(resolved.punctual),
                        fgLate: hexToRgb(resolved.late),
                        fgTraffic: hexToRgb(resolved.traffic),
                    })
                }>
                    Apply
                </button>
            </div>
        </div >
    );
};
