import { useState } from "react";
import type { BlackoutWindowDto, TimeDto } from "../model";

interface IWin98TimeInputProps {
    label: string;
    value: TimeDto;
    onChange: (time: TimeDto) => void;
}

const Win98TimeInput = ({ label, value, onChange }: IWin98TimeInputProps) => {
    return (
        <div className="flex items-center gap-2">
            <span className="text-sm w-10">{label}</span>
            <input
                type="number"
                min={0}
                max={23}
                value={value.hour}
                onChange={e => onChange({ ...value, hour: Math.max(0, Math.min(23, parseInt(e.target.value) || 0)) })}
                className="win98-input text-center"
                style={{ width: "64px" }}
            />
            <span className="text-sm font-bold">:</span>
            <input
                type="number"
                min={0}
                max={59}
                value={value.minute}
                onChange={e => onChange({ ...value, minute: Math.max(0, Math.min(59, parseInt(e.target.value) || 0)) })}
                className="win98-input text-center"
                style={{ width: "64px" }}
            />
        </div>
    );
};

interface IBlackoutWindowContentProps {
    blackoutWindow: undefined | BlackoutWindowDto;
    patchBlackoutWindow: (blackoutWindow: null | BlackoutWindowDto) => void;
}

export const BlackoutWindowContent = ({ blackoutWindow, patchBlackoutWindow }: IBlackoutWindowContentProps) => {
    const defaultTime: TimeDto = { hour: 0, minute: 0 };

    const [editStart, setEditStart] = useState<Partial<TimeDto>>({});
    const [editEnd, setEditEnd] = useState<Partial<TimeDto>>({});
    const [editOverride, setEditOverride] = useState<boolean | null>(null);

    const displayStart: TimeDto = { ...(blackoutWindow?.start ?? defaultTime), ...editStart };
    const displayEnd: TimeDto = { ...(blackoutWindow?.end ?? defaultTime), ...editEnd };
    const displayOverride = editOverride ?? blackoutWindow?.override ?? false;

    return (
        <div className="space-y-3" style={{ minWidth: "220px" }}>
            <Win98TimeInput label="Start" value={displayStart} onChange={setEditStart} />
            <Win98TimeInput label="End" value={displayEnd} onChange={setEditEnd} />

            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input
                    type="checkbox"
                    checked={displayOverride}
                    onChange={e => setEditOverride(e.target.checked)}
                    className="accent-[#000080]"
                />
                Override
            </label>

            <div className="text-right">
                <button className="win98-btn" onClick={() => {
                    patchBlackoutWindow({
                        start: displayStart,
                        end: displayEnd,
                        override: displayOverride,
                    });
                    setEditStart({});
                    setEditEnd({});
                    setEditOverride(null);
                }}>
                    Apply
                </button>
            </div>
        </div>
    );
};
