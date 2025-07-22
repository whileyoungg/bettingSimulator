import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

export default function Profile() {
    const { username } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [participations, setParticipations] = useState([]);
    const [createdEvents, setCreatedEvents] = useState([]);
    const [error, setError] = useState("");
    const [sessionUsername, setSessionUsername] = useState("");

    useEffect(() => {
        const userStr = sessionStorage.getItem("loggedInUser");
        if (!userStr) {
            navigate("/login");
            return;
        }

        try {
            const userObj = JSON.parse(userStr);
            setSessionUsername(userObj.username);
        } catch (err) {
            console.error("Failed to parse logged-in user.");
        }

        fetch(`http://localhost:8080/api/users/${username}`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch user profile.");
                return res.json();
            })
            .then(([userData, participationsData, createdEventsData]) => {
                setUser(userData);
                setParticipations(participationsData);
                setCreatedEvents(createdEventsData);
            })
            .catch((err) => {
                console.error(err);
                setError("Could not load profile.");
            });
    }, [username]);

    const handleLogout = () => {
        sessionStorage.removeItem("loggedInUser");
        navigate("/login");
        window.location.reload();
    };

    const thTdClass = "border border-zinc-600 px-4 py-2 text-zinc-300 text-sm";

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-red-500">
                {error}
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-zinc-300">
                Loading profile...
            </div>
        );
    }

    return (
        <div className="min-h-screen px-6 py-10 bg-zinc-900 text-white">
            <div className="max-w-6xl mx-auto space-y-12">
                {/* Profile Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-bold">{user.username}</h1>
                    {sessionUsername === username && (
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow"
                        >
                            Sign Out
                        </button>
                    )}
                </div>

                {/* Betting History */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Betting History</h2>
                    {participations.length === 0 ? (
                        <p className="text-zinc-400">No participations yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border border-zinc-700 text-sm">
                                <thead>
                                <tr className="bg-zinc-800">
                                    <th className={thTdClass}>Event</th>
                                    <th className={thTdClass}>Choice</th>
                                    <th className={thTdClass}>Stake</th>
                                    <th className={thTdClass}>Potential Win</th>
                                    <th className={thTdClass}>Result</th>
                                </tr>
                                </thead>
                                <tbody>
                                {participations.map((p, i) => (
                                    <tr key={i} className="bg-zinc-900 hover:bg-zinc-800 transition">
                                        <td className={thTdClass}>
                                            <Link
                                                to={`/events/${p.action.event.eventId}`}
                                                className="text-blue-400 hover:underline"
                                            >
                                                {p.action.event.event}
                                            </Link>
                                        </td>
                                        <td className={thTdClass}>{p.action.action}</td>
                                        <td className={thTdClass}>${p.stake.toFixed(2)}</td>
                                        <td className={thTdClass}>${p.potentialWin.toFixed(2)}</td>
                                        <td className={thTdClass}>
                                            {!p.action.event.isFinished ? (
                                                <span className="text-yellow-400">Live</span>
                                            ) : p.hasWon ? (
                                                <span className="text-green-500">Won</span>
                                            ) : (
                                                <span className="text-red-500">Lost</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <section>
                <h2 className="text-2xl font-semibold mb-4">Events Hosted</h2>
                    {createdEvents.length === 0 ? (
                        <p className="text-zinc-400">No events created yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border border-zinc-700 text-sm">
                                <thead>
                                <tr className="bg-zinc-800">
                                    <th className={thTdClass}>Event</th>
                                    <th className={thTdClass}>Actions</th>
                                    <th className={thTdClass}>Status</th>
                                    <th className={thTdClass}>Privacy</th>
                                    <th className={thTdClass}>Initial Budget</th>
                                    <th className={thTdClass}>Current Budget</th>
                                    <th className={thTdClass}>Profit / Loss</th>
                                    <th className={thTdClass}>Created</th>
                                    <th className={thTdClass}>Finished</th>
                                </tr>
                                </thead>
                                <tbody>
                                {createdEvents.map((dto, i) => {
                                    const e = dto.event;
                                    const initial = dto.initialBudget;
                                    const current = e.budget;
                                    const delta = current - initial;
                                    const isProfit = delta >= 0;

                                    return (
                                        <tr key={i} className="bg-zinc-900 hover:bg-zinc-800 transition">
                                            <td className={thTdClass}>
                                                <Link
                                                    to={`/events/${e.eventId}`}
                                                    className="text-blue-400 hover:underline"
                                                >
                                                    {e.event}
                                                </Link>
                                            </td>
                                            <td className={thTdClass}>
                                                {Array.isArray(e.actions) && e.actions.length > 0 ? (
                                                    e.actions
                                                        .map((a) => `${a.action} (${a.coefficient.toFixed(2)})`)
                                                        .join(" vs ")
                                                ) : (
                                                    "N/A"
                                                )}
                                            </td>
                                            <td className={thTdClass}>
                                                {e.isFinished ? (
                                                    <span className="text-red-500">Finished</span>
                                                ) : e.isOpen ? (
                                                    <span className="text-green-500">Open</span>
                                                ) : (
                                                    <span className="text-yellow-400">Closed</span>
                                                )}
                                            </td>
                                            <td className={thTdClass}>
                                                {e.isPublic ? "Public" : "Private"}
                                            </td>
                                            <td className={thTdClass}>${initial.toFixed(2)}</td>
                                            <td className={thTdClass}>${current.toFixed(2)}</td>
                                            <td className={`${thTdClass} ${isProfit ? "text-green-400" : "text-red-400"}`}>
                                                {isProfit ? "+" : "-"}${Math.abs(delta).toFixed(2)}
                                            </td>
                                            <td className={thTdClass}>
                                                {e.timeCreated ? new Date(e.timeCreated).toLocaleString() : "-"}
                                            </td>
                                            <td className={thTdClass}>
                                                {e.timeFinished ? new Date(e.timeFinished).toLocaleString() : "-"}
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
