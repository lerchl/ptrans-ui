import { useCallback, useEffect, useState } from "react";
import type { FetchAndHandleFunction } from "../App";
import type { LioDto } from "../model";

const BASE_URL_DATA = import.meta.env.VITE_BASE_URL_DATA;

interface ITimetableTabProps {
    fetchAndHandle: FetchAndHandleFunction
};

export const TimetableTab = ({ fetchAndHandle }: ITimetableTabProps) => {

    const [lios, setLios] = useState<LioDto[]>([]);
    const [newLio, setNewLio] = useState<Partial<LioDto>>({});

    const getLios = useCallback(() =>
        fetchAndHandle<LioDto[]>({ fetchF: () => fetch(`${BASE_URL_DATA}/lio`), handleF: json => setLios(json!) }), [fetchAndHandle]);

    useEffect(() => {
        getLios();
    }, [getLios]);

    const deleteLio = (id: string) => fetchAndHandle<void>({
        fetchF: () => fetch(`${BASE_URL_DATA}/lio/${id}`, {
            method: "DELETE"
        }),
        handleF: () => getLios()
    });

    const postLio = () => fetchAndHandle<LioDto>({
        fetchF: () => fetch(`${BASE_URL_DATA}/lio`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ ...newLio })
        }),
        handleF: () => { setNewLio({}); getLios(); }
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
