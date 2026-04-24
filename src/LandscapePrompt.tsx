import { Window } from "./App";

export const LandscapePrompt = () => {
    return (
        <div className="fixed inset-0 z-[9999] bg-[#008080] landscape:hidden">
            <Window
                show={true}
                title="Display Settings"
                modal
                content={
                    <div className="flex flex-col items-center gap-3">
                        <PhoneIcon />
                        <div className="w-full h-[2px] border-t border-t-[#808080] border-b border-b-white" />
                        <p className="text-sm text-center">
                            Please rotate your device to landscape mode to continue.
                        </p>
                    </div>
                }
            />
        </div>
    );
};

function PhoneIcon() {
    return (
        <div style={{ height: "80px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{
                width: "28px",
                height: "48px",
                borderTop: "3px solid #404040",
                borderLeft: "3px solid #404040",
                borderRight: "3px solid #ffffff",
                borderBottom: "3px solid #ffffff",
                background: "#c0c0c0",
                position: "relative",
                transformOrigin: "center center",
                animation: "win98-rotate 2s steps(1, end) infinite",
            }}>
                <div style={{
                    position: "absolute",
                    top: "6px", left: "3px", right: "3px",
                    height: "22px",
                    background: "#000080",
                }} />
                <div style={{
                    position: "absolute",
                    bottom: "4px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "8px",
                    height: "5px",
                    borderTop: "1px solid #fff",
                    borderLeft: "1px solid #fff",
                    borderRight: "1px solid #404040",
                    borderBottom: "1px solid #404040",
                    background: "#a0a0a0",
                }} />
            </div>
        </div>
    );
}
