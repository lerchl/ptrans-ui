import { useCallback, useEffect, useState, type JSX } from "react"
import "./App.css"
import clsx from "clsx";

const VERSION_UI = import.meta.env.VITE_APP_VERSION ?? "unknown";
const BASE_URL_RGB = import.meta.env.VITE_BASE_URL_RGB;
const BASE_URL_DATA = import.meta.env.VITE_BASE_URL_DATA;

interface IError {
    headline: string;
    messages: string[];
}

interface IFetchAndHandleFunctionArgs<T> {
    fetchF: () => Promise<Response>,
    handleF?: (t: T) => void,
    noLoadingWindow?: boolean
}
type FetchAndHandleFunction = <T>(args: IFetchAndHandleFunctionArgs<T>) => Promise<boolean>;

export const App = () => {

    const [loading, setLoading] = useState<number>(0)
    const [error, setError] = useState<IError | null>(null);

    const fetchAndHandle = useCallback(async function <T>(args: IFetchAndHandleFunctionArgs<T>): Promise<boolean> {
        if (args.noLoadingWindow !== true) {
            setLoading(prev => prev + 1);
        }

        let errorMessage = "";

        try {
            const res = await args.fetchF();

            if (res.ok) {
                if (res.status === 200) {
                    const json: T = await res.json();

                    if (args.handleF) {
                        args.handleF(json);
                    }
                }

                if (!args.noLoadingWindow) {
                    setLoading(prev => prev - 1);
                }

                return true;
            } else if (res.status === 404) {
                errorMessage = res.status + " " + res.url;
            } else {
                errorMessage = res.status + "\n" + res.body;
            }
        } catch (e) {
            if (e instanceof TypeError || e instanceof SyntaxError) {
                errorMessage = e.message + "\n" + e.stack;
            } else {
                errorMessage = JSON.stringify(e);
            }
        }

        setError(prev => {
            const messages = prev?.messages ?? [];
            if (!messages.includes(errorMessage)) {
                messages.push(errorMessage);
            }

            return {
                headline: messages.length > 1 ? "Multiple errors have occured:" : "An error has occured:",
                messages: messages
            };
        });

        if (!args.noLoadingWindow) {
            setLoading(prev => prev - 1);
        }

        return false;
    }, []);

    const [versionRgb, setVersionRgb] = useState<string>("unknown");
    const [versionData, setVersionData] = useState<string>("unknown");
    const [mode, setMode] = useState<number>(0);

    useEffect(() => {
        const getVersionRgb = async () => fetchAndHandle<{ version: string; }>({ fetchF: () => fetch(`${BASE_URL_RGB}/version`), handleF: json => setVersionRgb(json.version) });
        const getVersionData = async () => fetchAndHandle<{ version: string; }>({ fetchF: () => fetch(`${BASE_URL_DATA}/version`), handleF: json => setVersionData(json.version) });
        const getMode = async () => fetchAndHandle<{ mode: number; }>({ fetchF: () => fetch(`${BASE_URL_RGB}/mode`), handleF: json => setMode(json.mode) });

        getVersionRgb();
        getVersionData();
        getMode();
    }, [fetchAndHandle]);

    const updateMode = async (mode: number) => {
        const success = await fetchAndHandle<void>({
            fetchF: () => fetch(`${BASE_URL_RGB}/mode`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ mode }),
            })
        });

        if (success) {
            setMode(mode);
        }
    }
    return (

        <div className="h-screen bg-[#008080] flex flex-col font-sans">
            <div className="flex-1 flex items-center justify-center space-x-5">
                <Window modal show={loading > 0} title="Loading" content={<Win98ProgressBar />} />
                <Window show={true} title="Info" content={<InfoContent componentVersions={[
                    { component: "UI", version: VERSION_UI },
                    { component: "RGB", version: versionRgb },
                    { component: "Data", version: versionData }
                ]} />} />
                <Window show={true} title="Content" content={<><Tabs current={mode} onChange={updateMode} />
                    {mode === 0 && <TimetableTab fetchAndHandle={fetchAndHandle} />}
                    {mode === 1 && <CustomTextTab fetchAndHandle={fetchAndHandle} />}
                </>} />
                <Window show={true} title="Brightness" content={<BrightnessContent fetchAndHandle={fetchAndHandle} />} />
                <Window modal closeAction={() => setError(null)} show={!!error} title="Error" content={<div className="flex gap-3 items-start">
                    <Win98ErrorIcon />

                    <div className="text-sm">
                        <p className="font-bold mb-1">{error?.headline}</p>
                        {
                            error?.messages?.map(message => <p key={message}>{message}</p>)
                        }
                    </div>
                </div>} />
            </div>

            <Taskbar />
        </div>
    )
}

function Win98ProgressBar() {
    return (
        <div
            className="
        w-full
        h-4
        bg-white
        border
        border-t-[#404040]
        border-l-[#404040]
        border-r-white
        border-b-white
        overflow-hidden
      "
        >
            <div className="h-full win98-progress-fill" />
        </div>
    );
}

function Win98ErrorIcon() {
    return (
        <div
            className="
        w-8 h-8
        rounded-full
        bg-[#ff0000]
        border border-black
        flex items-center justify-center
        text-white
        font-bold
        text-lg
        leading-none
        select-none
      "
        >
            ×
        </div>
    );
}

function Taskbar() {
    return (
        <div
            className="
        h-10
        bg-[#c0c0c0]
        border-t-2 border-t-white
        flex items-center
        px-2
        gap-2
      "
        >
            <button className="win98-btn font-bold">Start</button>

            <div
                className="
          bg-[#c0c0c0]
          px-3 py-1
          border
          border-t-[#404040]
          border-l-[#404040]
          border-r-white
          border-b-white
          text-sm
        "
            >
                Info
            </div>

            <div
                className="
          bg-[#c0c0c0]
          px-3 py-1
          border
          border-t-[#404040]
          border-l-[#404040]
          border-r-white
          border-b-white
          text-sm
        "
            >
                Content
            </div>

            <div
                className="
          bg-[#c0c0c0]
          px-3 py-1
          border
          border-t-[#404040]
          border-l-[#404040]
          border-r-white
          border-b-white
          text-sm
        "
            >
                Brightness
            </div>

            {/* system tray spacer */}
            <div className="ml-auto" />

            <Clock />
        </div>
    );
}

function Clock() {
    const [time, setTime] = useState(() => new Date());

    useEffect(() => {
        const tick = () => setTime(new Date());

        // align to the next minute
        const now = new Date();
        const msUntilNextMinute =
            (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

        const timeout = setTimeout(() => {
            tick();
            const interval = setInterval(tick, 60_000);
            return () => clearInterval(interval);
        }, msUntilNextMinute);

        return () => clearTimeout(timeout);
    }, []);

    const formatted = time.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <div
            className="
        px-3 py-1
        text-sm
        bg-[#c0c0c0]
        border
        border-t-[#404040]
        border-l-[#404040]
        border-r-white
        border-b-white
        min-w-[56px]
        text-center
      "
        >
            {formatted}
        </div>
    );
}

interface IWindowProps {
    show: boolean;
    title: string;
    content: JSX.Element;
    modal?: boolean;
    closeAction?: () => void;
}

const Window = ({ show, title, content, modal = false, closeAction }: IWindowProps) => {
    if (!show) return null;

    return (
        <div
            className={clsx({ "fixed inset-0 flex items-center justify-center z-50": modal, "relative": !modal })}
        >
            {modal && (
                <div className="absolute inset-0 bg-black opacity-40"></div>
            )}

            <div className="bg-[#c0c0c0] border border-t-white border-l-white border-r-[#404040] border-b-[#404040] min-w-[100px] z-50">
                <TitleBar title={title} closeAction={closeAction} />
                <div className="p-3">{content}</div>
            </div>
        </div>
    );
}

interface ITitleBarProps {
    title: string;
    closeAction?: () => void;
}

function TitleBar({ title, closeAction }: ITitleBarProps) {
    return (
        <div
            className="
        bg-[#000080]
        text-white
        px-2 py-1
        flex justify-between items-center
        text-sm
      "
        >
            <span>{title}</span>

            <div className={clsx({ "hidden": !closeAction }, "flex gap-1")}>
                <button
                    className="
      w-4 h-4
      bg-[#c0c0c0]
      border border-black
      text-black
      text-[10px]
      font-bold
      flex items-center justify-center
      leading-none
      select-none
    "
                    onClick={closeAction}>
                    ×
                </button>
            </div>
        </div>
    );
}

interface IInfoContentProps {
    componentVersions: {
        component: string;
        version: string;
    }[];
};

const InfoContent = ({ componentVersions }: IInfoContentProps) => {

    return (
        <div className="space-y-3">
            <div className="overflow-auto border border-black bg-[#c0c0c0]">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr>
                            <th className="px-2 py-1 border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#c0c0c0] text-left">Component</th>
                            <th className="px-2 py-1 border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#c0c0c0] text-left">Version</th>
                        </tr>
                    </thead>

                    <tbody>
                        {
                            componentVersions.map(cv => <tr key={cv.component}>
                                <td className="px-2 py-1 border-t-[#404040] border-l-[#404040] border-r-white border-b-white bg-white">{cv.component}</td>
                                <td className="px-2 py-1 border-t-[#404040] border-l-[#404040] border-r-white border-b-white bg-white">{cv.version}</td>
                            </tr>)
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function Tabs({
    current,
    onChange,
}: {
    current: number;
    onChange: (mode: number) => void;
}) {
    return (
        <div className="flex gap-1 mb-3">
            <button
                onClick={() => onChange(0)}
                className={current === 0 ? "win98-tab-active" : "win98-tab"}
            >
                Timetable
            </button>

            <button
                onClick={() => onChange(1)}
                className={current === 1 ? "win98-tab-active" : "win98-tab"}
            >
                Custom Text
            </button>
        </div>
    );
}

interface ILio {
    id: string,
    provider: string,
    station: string,
    line: string,
    direction: string
};

interface ITimetableTabProps {
    fetchAndHandle: FetchAndHandleFunction
};

const TimetableTab = ({ fetchAndHandle }: ITimetableTabProps) => {

    const [lios, setLios] = useState<ILio[]>([]);
    const [newLio, setNewLio] = useState<Partial<ILio>>({});

    const getLios = useCallback(() =>
        fetchAndHandle<ILio[]>({ fetchF: () => fetch(`${BASE_URL_DATA}/lio`), handleF: json => setLios(json) }), [fetchAndHandle]);

    useEffect(() => {
        getLios();
    }, [getLios]);

    const deleteLio = (id: string) => fetchAndHandle<void>({
        fetchF: () => fetch(`${BASE_URL_DATA}/lio/${id}`, {
            method: "DELETE"
        })
    });


    const postLio = () => fetchAndHandle<ILio>({
        fetchF: () => fetch(`${BASE_URL_DATA}/lio`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ ...newLio })
        }), handleF: () => { setNewLio({}); getLios(); }
    });


    return (
        <div className="space-y-3">
            <div className="overflow-auto border border-black bg-[#c0c0c0]">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr>
                            <th className="px-2 py-1 border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#c0c0c0] text-left">Provider</th>
                            <th className="px-2 py-1 border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#c0c0c0] text-left">Station</th>
                            <th className="px-2 py-1 border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#c0c0c0] text-left">Line</th>
                            <th className="px-2 py-1 border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#c0c0c0] text-left">Direction</th>
                            <th className="px-2 py-1 border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#c0c0c0]">Delete</th>
                        </tr>
                    </thead>

                    <tbody>
                        {lios.map(lio => (
                            <tr key={lio.id}>
                                <td className="px-2 py-1 border-t-[#404040] border-l-[#404040] border-r-white border-b-white bg-white">{lio.provider}</td>
                                <td className="px-2 py-1 border-t-[#404040] border-l-[#404040] border-r-white border-b-white bg-white">{lio.station}</td>
                                <td className="px-2 py-1 border-t-[#404040] border-l-[#404040] border-r-white border-b-white bg-white">{lio.line}</td>
                                <td className="px-2 py-1 border-t-[#404040] border-l-[#404040] border-r-white border-b-white bg-white">{lio.direction}</td>
                                <td className="px-2 py-1 border-t-[#404040] border-l-[#404040] border-r-white border-b-white bg-white text-center">
                                    <button
                                        onClick={() => deleteLio(lio.id)}
                                        className="win98-btn text-xs px-2 py-0.5"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add new LIO form */}
            <div className="border border-black bg-[#c0c0c0] p-2 space-y-2">
                <p className="text-sm font-bold">Add new LIO</p>

                {/* First row: Provider + Station */}
                <div className="grid grid-cols-2 gap-2">
                    <select
                        value={newLio.provider || ""}
                        onChange={e => setNewLio(prev => ({ ...prev, provider: e.target.value }))}
                        className="win98-input"
                    >
                        <option value="" disabled>Select provider</option>
                        <option value="Wiener Linien">Wiener Linien</option>
                        <option value="OEBB">ÖBB</option>
                    </select>

                    <input
                        placeholder="Station"
                        value={newLio.station || ""}
                        onChange={e => setNewLio(prev => ({ ...prev, station: e.target.value }))}
                        className="win98-input"
                    />
                </div>

                {/* Second row: Line + Direction */}
                <div className="grid grid-cols-2 gap-2">
                    <input
                        placeholder="Line"
                        value={newLio.line || ""}
                        onChange={e => setNewLio(prev => ({ ...prev, line: e.target.value }))}
                        className="win98-input"
                    />
                    <input
                        placeholder="Direction"
                        value={newLio.direction || ""}
                        onChange={e => setNewLio(prev => ({ ...prev, direction: e.target.value }))}
                        className="win98-input"
                    />
                </div>

                <button onClick={postLio} className="win98-btn mt-2">
                    Add LIO
                </button>
            </div>
        </div>
    );
}

interface ICustomTextTabProps {
    fetchAndHandle: FetchAndHandleFunction
};

const CustomTextTab = ({ fetchAndHandle }: ICustomTextTabProps) => {

    const [text, setText] = useState<string>("");

    useEffect(() => {
        const getText = () =>
            fetchAndHandle<{ text: string }>({ fetchF: () => fetch(`${BASE_URL_RGB}/text`), handleF: json => setText(json.text) });

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

interface IBrightnessContentProps {
    fetchAndHandle: FetchAndHandleFunction
}

const BrightnessContent = ({ fetchAndHandle }: IBrightnessContentProps) => {

    const [brightness, setBrightness] = useState(0);

    useEffect(() => {
        const getBrightness = () => fetchAndHandle<{ brightness: number }>({ fetchF: () => fetch(`${BASE_URL_RGB}/brightness`), handleF: json => { setBrightness(json.brightness) } });
        getBrightness();
    }, [fetchAndHandle]);

    const updateBrightness = (brightness: number) => {
        setBrightness(brightness);

        fetchAndHandle({
            fetchF: () => fetch(`${BASE_URL_RGB}/brightness`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ brightness: brightness })
            }),
            noLoadingWindow: true
        });
    }

    const trackHeight = 160;
    const thumbSize = 20;
    const travel = trackHeight - thumbSize;
    const thumbTop = travel - Math.round((brightness / 100) * travel);

    const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const value = Math.round((1 - y / trackHeight) * 100);
        updateBrightness(Math.max(0, Math.min(100, value)));
    };

    return (
        <div className="flex flex-col items-center gap-2 py-1">
            <span className="text-sm select-none">☀️</span>

            {/* Track */}
            <div
                className="relative cursor-pointer"
                style={{ width: "28px", height: `${trackHeight}px` }}
                onClick={handleTrackClick}
            >
                {/* Sunken track groove */}
                <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0"
                    style={{ width: "6px" }}>
                    {/* Outer dark border */}
                    <div className="absolute inset-0 border border-t-[#404040] border-l-[#404040] border-r-white border-b-white" />
                    {/* Inner darker inset */}
                    <div className="absolute inset-px border border-t-[#808080] border-l-[#808080] border-r-[#dfdfdf] border-b-[#dfdfdf] bg-[#c0c0c0]" />
                </div>

                {/* Thumb */}
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
                            updateBrightness(Math.max(0, Math.min(100, value)));
                        };
                        const onUp = () => {
                            window.removeEventListener("mousemove", onMove);
                            window.removeEventListener("mouseup", onUp);
                        };
                        window.addEventListener("mousemove", onMove);
                        window.addEventListener("mouseup", onUp);
                    }}>
                    {/* Thumb grip lines */}
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

            <span className="text-sm select-none">🌑</span>

            {/* Value readout */}
            <div className="px-2 py-0.5 text-xs bg-white border border-t-[#404040] border-l-[#404040] border-r-white border-b-white min-w-[40px] text-center font-mono">
                {brightness}
            </div>
        </div>
    );
}
