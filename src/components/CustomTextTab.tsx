import { useEffect, useState } from "react";
import type { FetchAndHandleFunction } from "../App";

const BASE_URL_RGB = import.meta.env.VITE_BASE_URL_RGB;

interface ICustomTextTabProps {
    fetchAndHandle: FetchAndHandleFunction
};

export const CustomTextTab = ({ fetchAndHandle }: ICustomTextTabProps) => {

    const [text, setText] = useState<string>("");

    useEffect(() => {
        const getText = () =>
            fetchAndHandle<{ text: string }>({ fetchF: () => fetch(`${BASE_URL_RGB}/text`), handleF: json => setText(json?.text ?? "") });

        getText();
    }, [fetchAndHandle]);

    const postText = (text: string) => fetchAndHandle<void>({
        fetchF: () => fetch(`${BASE_URL_RGB}/text`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text })
        })
    });

    return (
        <div className="space-y-2">
            <label className="block text-sm">Custom LED text:</label>

            <input
                value={text}
                onChange={e => setText(e.target.value)}
                className="win98-input"
                placeholder="Hello world"
            />


            <div className="text-right">
                <button
                    className="win98-btn"
                    onClick={() => postText(text)}
                >
                    Update Text
                </button>
            </div>
        </div>
    );
}
