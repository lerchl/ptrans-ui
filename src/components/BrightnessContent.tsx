import { useRef, useState } from "react";

interface IBrightnessContentProps {
    brightness: undefined | number;
    onChange: (brightness: number) => void
}

export const BrightnessContent = ({ brightness, onChange }: IBrightnessContentProps) => {
    const [dragging, setDragging] = useState<number | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const displayed = dragging ?? brightness ?? 0;
    const trackHeight = 160;
    const thumbSize = 20;
    const travel = trackHeight - thumbSize;
    const thumbTop = travel - Math.round((displayed / 100) * travel);

    const handleChange = (value: number) => {
        setDragging(value);
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
            onChange(value);
            debounceRef.current = null;
        }, 200);
    };

    const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const value = Math.round((1 - y / trackHeight) * 100);
        handleChange(Math.max(0, Math.min(100, value)));
    };

    return (
        <div className="flex flex-col items-center gap-2 py-1">
            <div
                className="relative cursor-pointer"
                style={{ width: "28px", height: `${trackHeight}px` }}
                onClick={handleTrackClick}
            >
                <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0"
                    style={{ width: "6px" }}>
                    <div className="absolute inset-0 border border-t-[#404040] border-l-[#404040] border-r-white border-b-white" />
                    <div className="absolute inset-px border border-t-[#808080] border-l-[#808080] border-r-[#dfdfdf] border-b-[#dfdfdf] bg-[#c0c0c0]" />
                </div>

                <div
                    className="absolute left-1/2 -translate-x-1/2 bg-[#c0c0c0] border border-t-white border-l-white border-r-[#404040] border-b-[#404040] cursor-pointer select-none"
                    style={{ width: `${thumbSize + 8}px`, height: `${thumbSize}px`, top: `${thumbTop}px` }}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        const track = e.currentTarget.parentElement!;
                        const onMove = (me: MouseEvent) => {
                            const rect = track.getBoundingClientRect();
                            const y = me.clientY - rect.top;
                            const value = Math.round((1 - y / trackHeight) * 100);
                            handleChange(Math.max(0, Math.min(100, value)));
                        };
                        const onUp = () => {
                            setDragging(null);
                            window.removeEventListener("mousemove", onMove);
                            window.removeEventListener("mouseup", onUp);
                        };
                        window.addEventListener("mousemove", onMove);
                        window.addEventListener("mouseup", onUp);
                    }}>
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-px">
                        {[0, 1, 2].map(i => (
                            <div key={i} className="w-3 flex flex-col">
                                <div className="h-px bg-[#404040]" />
                                <div className="h-px bg-white" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="px-2 py-0.5 text-xs bg-white border border-t-[#404040] border-l-[#404040] border-r-white border-b-white min-w-[40px] text-center font-mono">
                {displayed}
            </div>
        </div>
    );
}
