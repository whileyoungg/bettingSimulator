import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EventAnalysis() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [participations, setParticipations] = useState([]);
    const [suggested, setSuggested] = useState([]);
    const [currentActions, setCurrentActions] = useState([]);
    const [coefficients, setCoefficients] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [creatorUsername, setCreatorUsername] = useState("");
    const [search, setSearch] = useState("");

    const sessionUser = (() => {
        try {
            return JSON.parse(sessionStorage.getItem("loggedInUser"));
        } catch {
            return null;
        }
    })();

    const isCreator = sessionUser?.username === creatorUsername;

    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                const res = await fetch(`http://localhost:8080/api/events/${id}/analysis`);
                if (!res.ok) throw new Error("Failed to load event analysis");
                const [participations] = await res.json();
                setParticipations(participations);

                const allActions = participations.map(p => p.action);
                const uniqueActions = Array.from(
                    new Map(allActions.map(a => [a.actionId, a])).values()
                );
                setCurrentActions(uniqueActions);

                if (participations.length > 0) {
                    setCreatorUsername(participations[0].action.event.creator);
                }
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchAnalysis();
    }, [id]);

    useEffect(() => {
        if (creatorUsername) {
            if (sessionUser?.username !== creatorUsername) {
                navigate(`/events/${id}`);
            } else {
                fetch(`http://localhost:8080/api/events/${id}/suggested`)
                    .then(res => res.json())
                    .then(data => {
                        const coeffMap = {};
                        data.forEach(a => {
                            coeffMap[a.actionId] = a.coefficient.toFixed(2);
                        });
                        setSuggested(data);
                        setCoefficients(coeffMap);
                        setLoading(false);
                    })
                    .catch(err => {
                        setError("Failed to load suggested actions");
                        setLoading(false);
                    });
            }
        }
    }, [creatorUsername]);

    const handleCoefficientChange = (actionId, newValue) => {
        setCoefficients(prev => ({
            ...prev,
            [actionId]: newValue
        }));
    };

    const handleUpdate = (actionId) => {
        const newCoefficient = parseFloat(coefficients[actionId]);
        if (isNaN(newCoefficient) || newCoefficient < 1.01 || newCoefficient > 5.0) {
            alert("Invalid coefficient value. Must be between 1.01 and 5.00");
            return;
        }

        fetch(`http://localhost:8080/api/events/actions/${actionId}/updateCoefficient?coefficient=${newCoefficient}`, {
            method: "PATCH"
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to update coefficient");
                alert("Coefficient updated successfully!");
            })
            .catch((err) => {
                alert("Error: " + err.message);
            });
    };

    if (loading) return <div className="p-4 text-white">Loading analysis...</div>;
    if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

    const filteredParticipations = participations.filter(p =>
        p.user.username.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 bg-zinc-900 text-white min-h-screen">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Event Coefficient Analysis</h1>
                <button
                    onClick={() => navigate(`/events/${id}`)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded"
                >
                    Exit
                </button>
            </div>

            <input
                type="text"
                placeholder="Search by nickname..."
                className="px-3 py-2 rounded bg-zinc-800 text-white w-full sm:w-1/2 mb-4"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <table className="w-full border border-zinc-700 text-sm mb-8">
                <thead>
                <tr className="bg-zinc-800">
                    <th className="p-2 border border-zinc-600">Action</th>
                    <th className="p-2 border border-zinc-600">Current Coefficient</th>
                    <th className="p-2 border border-zinc-600">Suggested</th>
                    <th className="p-2 border border-zinc-600">Total Stake</th>
                    <th className="p-2 border border-zinc-600">Edit</th>
                    <th className="p-2 border border-zinc-600">Save</th>
                </tr>
                </thead>
                <tbody>
                {currentActions.map(action => {
                    const actionId = action.actionId;
                    const suggestedAction = suggested.find(a => a.actionId === actionId);
                    const totalStake = participations
                        .filter(p => p.action.actionId === actionId)
                        .reduce((acc, p) => acc + p.stake, 0);

                    return (
                        <tr key={actionId} className="bg-zinc-900 hover:bg-zinc-800">
                            <td className="p-2 border border-zinc-700">{action.action}</td>
                            <td className="p-2 border border-zinc-700">{action.coefficient.toFixed(2)}</td>
                            <td className="p-2 border border-zinc-700">{suggestedAction?.coefficient.toFixed(2) ?? "N/A"}</td>
                            <td className="p-2 border border-zinc-700">${totalStake.toFixed(2)}</td>
                            <td className="p-2 border border-zinc-700">
                                <input
                                    type="number"
                                    step="0.01"
                                    min="1.01"
                                    max="5.00"
                                    value={coefficients[actionId] || ""}
                                    onChange={(e) => handleCoefficientChange(actionId, e.target.value)}
                                    className="bg-zinc-700 text-white px-2 py-1 rounded w-20"
                                />
                            </td>
                            <td className="p-2 border border-zinc-700">
                                <button
                                    onClick={() => handleUpdate(actionId)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                                >
                                    Save
                                </button>
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>

            <h2 className="text-xl font-semibold mb-2">Participations</h2>
            <ul className="bg-zinc-800 rounded p-4 space-y-2">
                {filteredParticipations.map(p => (
                    <li key={p.participationId} className="flex justify-between">
                        <span>{p.user.username}</span>
                        <span>${p.stake.toFixed(2)} on "{p.action.action}"</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
