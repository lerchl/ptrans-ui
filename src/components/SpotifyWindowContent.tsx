import { useCallback, useEffect, useState } from "react";
import type { FetchAndHandleFunction } from "../App";
import type { UserDto } from "../model";

const BASE_URL_DATA = import.meta.env.VITE_BASE_URL_DATA;

interface ISpotifyWindowContentProps {
    fetchAndHandle: FetchAndHandleFunction
};

export const SpotifyWindowContent = ({ fetchAndHandle }: ISpotifyWindowContentProps) => {

    const [users, setUsers] = useState<UserDto[]>([]);

    const getUsers = useCallback(() =>
        fetchAndHandle<UserDto[]>({ fetchF: () => fetch(`${BASE_URL_DATA}/spotify/users`), handleF: json => setUsers(json!) }), [fetchAndHandle]);

    const authorize = () => window.location.href = `${BASE_URL_DATA}/spotify/authorize`;

    useEffect(() => {
        getUsers();
    }, [getUsers]);

    return (
        <div className="space-y-3">
            <div className="overflow-auto border border-black bg-[#c0c0c0]">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr>
                            <th className="px-2 py-1 border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#c0c0c0] text-left">Display Name</th>
                            <th className="px-2 py-1 border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#c0c0c0] text-left">Requires Reauthorization</th>
                        </tr>
                    </thead>

                    <tbody>
                        {users.map(user => (
                            <tr key={user.displayName}>
                                <td className="px-2 py-1 border-t-[#404040] border-l-[#404040] border-r-white border-b-white bg-white">
                                    {user.displayName}
                                </td>
                                <td className="px-2 py-1 border-t-[#404040] border-l-[#404040] border-r-white border-b-white bg-white">
                                    {user.requiresReAuth ? "Yes" : "No"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <button onClick={authorize} className="win98-btn">
                (Re-) Authorize Spotify
            </button>
        </div>
    );
}
