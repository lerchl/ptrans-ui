import { useCallback, useEffect, useState, type JSX } from "react"
import "./App.css"
import clsx from "clsx";
import { BrightnessContent } from "./components/BrightnessContent";
import type { ConfigurationDto, ErrorDto } from "./model";
import { ColorsContent } from "./components/ColorsContent";
import { TimetableTab } from "./components/TimetableTab";
import { CustomTextTab } from "./components/CustomTextTab";
import { BlackoutWindowContent } from "./components/BlackoutWindowContenxt";

const VERSION_UI = import.meta.env.VITE_APP_VERSION ?? "unknown";
const BASE_URL_RGB = import.meta.env.VITE_BASE_URL_RGB;
const BASE_URL_DATA = import.meta.env.VITE_BASE_URL_DATA;

interface IError {
    headline: string;
    messages: string[];
}

interface IFetchAndHandleFunctionArgs<T> {
    fetchF: () => Promise<Response>,
    handleF?: (t: T | null) => void,
    noLoadingWindow?: boolean
}
export type FetchAndHandleFunction = <T>(args: IFetchAndHandleFunctionArgs<T>) => Promise<boolean>;


export const App = () => {

    const [loading, setLoading] = useState<number>(0);
    const [error, setError] = useState<IError | null>(null);

    const fetchAndHandle = useCallback(async function <T>(args: IFetchAndHandleFunctionArgs<T>): Promise<boolean> {
        if (args.noLoadingWindow !== true) {
            setLoading(prev => prev + 1);
        }

        let errorMessage = "";

        try {
            const res = await args.fetchF();

            if (res.ok) {
                if (args.handleF) {
                    args.handleF(res.status !== 204 ? await res.json() : null);
                }

                if (!args.noLoadingWindow) {
                    setLoading(prev => prev - 1);
                }

                return true;
            } else if (res.status === 404) {
                errorMessage = res.status + " " + res.url;
            } else {
                errorMessage = res.status + "\n" + (await res.json() as ErrorDto).message;
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
    const [configuration, setConfiguration] = useState<null | ConfigurationDto>(null);

    useEffect(() => {
        const getVersionRgb = async () => fetchAndHandle<{ version: string; }>({ fetchF: () => fetch(`${BASE_URL_RGB}/version`), handleF: json => setVersionRgb(json!.version) });
        const getVersionData = async () => fetchAndHandle<{ version: string; }>({ fetchF: () => fetch(`${BASE_URL_DATA}/version`), handleF: json => setVersionData(json!.version) });
        const getConfiguration = async () => fetchAndHandle<ConfigurationDto>({ fetchF: () => fetch(`${BASE_URL_RGB}/configuration`), handleF: json => setConfiguration(json) });

        getVersionRgb();
        getVersionData();
        getConfiguration();
    }, [fetchAndHandle]);

    async function patchConfiguration(payload: unknown, noLoadingWindow: boolean = false, refetch: boolean = true) {
        const success = await fetchAndHandle<void>({
            fetchF: () => fetch(`${BASE_URL_RGB}/configuration`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload),
            }),
            noLoadingWindow: noLoadingWindow
        });

        if (refetch && success) {
            fetchAndHandle<ConfigurationDto>({ fetchF: () => fetch(`${BASE_URL_RGB}/configuration`), handleF: json => setConfiguration(json), noLoadingWindow: noLoadingWindow });
        }
    }

    const [showInfoWindow, setShowInfoWindow] = useState<boolean>(true);
    const [showContentWindow, setShowContentWindow] = useState<boolean>(true);
    const [showBlackoutWindowWindow, setShowBlackoutWindowWindow] = useState<boolean>(true);
    const [showBrightnessWindow, setShowBrightnessWindow] = useState<boolean>(true);
    const [showColorsWindow, setShowColorsWindow] = useState<boolean>(true);

    return (

        <div className="h-screen bg-[#008080] flex flex-col font-sans">
            <div className="flex-1 flex items-center justify-center space-x-5">
                <Window modal show={loading > 0} title="Loading" minWidth={400} content={<Win98ProgressBar />} />
                <Window show={showInfoWindow} title="Info" content={<InfoContent componentVersions={[
                    { component: "UI", version: VERSION_UI },
                    { component: "RGB", version: versionRgb },
                    { component: "Data", version: versionData }
                ]} />} />
                <Window show={showContentWindow} title="Content" minWidth={480} content={<><Tabs current={configuration?.mode} onChange={mode => patchConfiguration({ mode })} />
                    {configuration?.mode === 0 && <TimetableTab fetchAndHandle={fetchAndHandle} />}
                    {configuration?.mode === 1 && <CustomTextTab fetchAndHandle={fetchAndHandle} />}
                </>} />
                <Window show={showBlackoutWindowWindow} title="Blackout Window" content={
                    <BlackoutWindowContent
                        blackoutWindow={configuration?.blackoutWindow}
                        patchBlackoutWindow={blackoutWindow => patchConfiguration({ blackoutWindow })}
                    />
                } />
                <Window show={showBrightnessWindow} title="Brightness" content={<BrightnessContent brightness={configuration?.brightness} onChange={brightness => patchConfiguration({ brightness }, true, false)} />} />
                <Window show={showColorsWindow} title="Colors" content={<ColorsContent colors={configuration?.colors} patchColors={colors => patchConfiguration({ colors })} />} />
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

            <Taskbar windows={[
                { label: "Info", show: showInfoWindow, setShow: setShowInfoWindow },
                { label: "Content", show: showContentWindow, setShow: setShowContentWindow },
                { label: "Blackout Window", show: showBlackoutWindowWindow, setShow: setShowBlackoutWindowWindow },
                { label: "Brightness", show: showBrightnessWindow, setShow: setShowBrightnessWindow },
                { label: "Colors", show: showColorsWindow, setShow: setShowColorsWindow }
            ]} />
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

interface ITaskbarProps {
    windows: {
        label: string;
        show: boolean;
        setShow: (show: boolean) => void;
    }[];
}

const Taskbar = ({ windows }: ITaskbarProps) => {
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

            {
                windows.map(window =>
                    <button key={window.label} className={clsx(
                        "px-3 py-1 text-sm border",
                        window.show
                            ? "bg-[#c0c0c0] border-t-[#404040] border-l-[#404040] border-r-white border-b-white"
                            : "bg-[#c0c0c0] border-t-white border-l-white border-r-[#404040] border-b-[#404040]"
                    )} onClick={() => window.setShow(!window.show)}>
                        {window.label}
                    </button>
                )
            }

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
    minWidth?: number;
    modal?: boolean;
    closeAction?: () => void;
}

const Window = ({ show, title, content, minWidth = 40, modal = false, closeAction }: IWindowProps) => {
    if (!show) return null;

    return (
        <div
            className={clsx({ "fixed inset-0 flex items-center justify-center z-50": modal, "relative": !modal })}
        >
            {modal && (
                <div className="absolute inset-0 bg-black opacity-40"></div>
            )}

            <div
                style={{ minWidth: `${minWidth}px` }}
                className="bg-[#c0c0c0] border border-t-white border-l-white border-r-[#404040] border-b-[#404040] z-50">
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

const Tabs = ({ current, onChange }: { current: undefined | 0 | 1; onChange: (mode: number) => void; }) => {
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

