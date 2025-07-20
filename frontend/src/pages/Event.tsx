import { useEffect, useState } from "react";
import { useNavigate,useParams } from "react-router-dom";

export default function Event() {
    const { id: eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [password, setPassword] = useState("");
    const [winnersAction, setWinnersAction] = useState("");
    const [passwordInput, setPasswordInput] = useState("");
    const [form, setForm] = useState({ choice: "", stake: "" });
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const sessionUser = (() => {
        try {
            return JSON.parse(sessionStorage.getItem("loggedInUser"));
        } catch {
            return null;
        }
    })();

    const isCreator = sessionUser?.username === event?.creator;
    const navigate = useNavigate();

    useEffect(() => {
        if (!eventId) return;
        setError("");
        setSuccessMessage("");
        fetch(`http://localhost:8080/api/events/${eventId}`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch event");
                return res.json();
            })
            .then((data) => setEvent(data))
            .catch((err) => {
                console.error("Error loading event:", err);
                setError("Failed to load event details.");
            });
    }, [eventId]);

    const handleAction = async (actionFn, successMsg, errorMsg) => {
        setError("");
        setSuccessMessage("");
        try {
            await actionFn();
            setSuccessMessage(successMsg);
        } catch (err) {
            console.error(errorMsg, err);
            setError(errorMsg);
        }
    };

    const handleSetFinished = () => {
        handleAction(
            () =>
                fetch(
                    `http://localhost:8080/api/events/${eventId}/setFinished?winnersAction=${winnersAction}`,
                    {
                        method: "PATCH",
                    }
                ),
            "Event marked as finished!",
            "Failed to mark event as finished."
        );
    };

    const handleSetPrivate = () => {
        handleAction(
            () =>
                fetch(
                    `http://localhost:8080/api/events/${eventId}/setPrivate?password=${password}`,
                    {
                        method: "PATCH",
                    }
                ),
            "Event made private!",
            "Failed to make event private."
        );
    };

    const handleJoin = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        if (!sessionUser) {
            setError("Please log in to join.");
            return;
        }

        if (!event.isPublic && passwordInput !== event.password) {
            setError("Incorrect password.");
            return;
        }

        const selectedAction = event.actions.find((a) => a.action === form.choice);
        if (!selectedAction) {
            setError("Invalid action selected.");
            return;
        }

        const potentialWin = parseFloat(form.stake) * selectedAction.coefficient;

        const completeAction = {
            ...selectedAction,
            event: {
                event: event.event,
                eventId: event.eventId,
                budget: event.budget,
                stakeLimit: event.stakeLimit,
                playerLimit: event.playerLimit,
                isOpen: event.isOpen,
                isFinished: event.isFinished,
                isPublic: event.isPublic,
                creator: event.creator,
                password: event.password,
                initialBudget: event.initialBudget,
                timeCreated: event.timeCreated,
                timeFinished: event.timeFinished,
                actions: [] // backend may not need nested actions here
            }
        };

        const payload = {
            action: completeAction,
            user: sessionUser,
            stake: parseFloat(form.stake),
            potentialWin,
            hasWon: false,
        };

        try {
            const res = await fetch("http://localhost:8080/api/addParticipation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                console.log("Payload sent:", JSON.stringify(payload, null, 2));
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to join event");
            } else {
                setSuccessMessage("Participation added successfully!");
            }

            fetch(`http://localhost:8080/api/events/${eventId}`)
                .then((res) => res.json())
                .then((data) => setEvent(data));
        } catch (err) {
            console.error("Join error:", err);
            setError(err.message || "Error joining event.");
        }
    };

    if (!event)
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-zinc-300">
                <p className="p-4">Loading event...</p>
            </div>
        );

    const buttonClass =
        "bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold text-sm transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500";
    const inputClass =
        "w-full p-3 rounded-lg bg-zinc-700 text-white placeholder-zinc-400 border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500";
    const selectClass =
        "w-full p-3 rounded-lg bg-zinc-700 text-white border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500";
    const adminSectionClass =
        "bg-zinc-800 p-6 rounded-2xl shadow-2xl border border-zinc-700 space-y-5";
    const infoSectionClass =
        "bg-zinc-800 p-6 rounded-2xl shadow-2xl border border-zinc-700 space-y-3";

    return (
        <div className="min-h-screen flex flex-col items-center py-8 bg-zinc-900 px-4">
            <div className="w-full max-w-2xl bg-zinc-800 p-8 rounded-2xl shadow-2xl border border-zinc-700 space-y-6">
                <h2 className="text-4xl font-extrabold text-white text-center mb-4">
                    {event.event}
                </h2>
                {error && (
                    <div className="bg-red-600 text-white px-4 py-3 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}
                {successMessage && (
                    <div className="bg-green-600 text-white px-4 py-3 rounded-lg text-sm text-center">
                        {successMessage}
                    </div>
                )}

                <div className={infoSectionClass}>
                    <p className="text-zinc-300 text-lg">
                        <strong className="text-white">Creator:</strong> {event.creator}
                    </p>
                    <p className="text-zinc-300 text-lg">
                        <strong className="text-white">Actions:</strong>{" "}
                        {event.actions.map((a, i) => (
                            <span key={a.actionId} className="mr-4">
                                {a.action}{" "}
                                <span className="text-blue-400 font-semibold">
                                    ({a.coefficient})
                                </span>
                                {i < event.actions.length - 1 && " vs "}
                            </span>
                        ))}
                    </p>
                    <p className="text-zinc-300 text-lg">
                        <strong className="text-white">Budget:</strong> ${event.budget}
                    </p>
                    <p className="text-zinc-300 text-lg">
                        <strong className="text-white">Stake Limit:</strong> ${event.stakeLimit}
                    </p>
                    <p className="text-zinc-300 text-lg">
                        <strong className="text-white">Status:</strong>{" "}
                        <span
                            className={`${
                                event.isFinished
                                    ? "text-red-500"
                                    : event.isOpen
                                        ? "text-green-500"
                                        : "text-yellow-500"
                            } font-semibold`}
                        >
                            {event.isFinished
                                ? "Finished"
                                : event.isOpen
                                    ? "Open"
                                    : "Closed"}
                        </span>
                    </p>
                    {!event.isPublic && (
                        <p className="text-zinc-300 text-lg">
                            <strong className="text-white">Type:</strong>{" "}
                            <span className="text-purple-400 font-semibold">Private</span>
                        </p>
                    )}
                </div>

                {isCreator && (
                    <div className={adminSectionClass}>
                        <h3 className="font-bold text-2xl text-white text-center">
                            Admin Controls
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                                onClick={() =>
                                    handleAction(
                                        () =>
                                            fetch(
                                                `http://localhost:8080/api/events/${eventId}/setOpen`,
                                                {method: "PATCH"}
                                            ),
                                        "Event opened!",
                                        "Failed to open event."
                                    )
                                }
                                className={buttonClass}
                            >
                                Open Event
                            </button>
                            <button
                                onClick={() => navigate(`/events/${eventId}/analysis`)}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-4 rounded-lg font-semibold text-sm transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                Go to Analysis
                            </button>
                            <button
                                onClick={() =>
                                    handleAction(
                                        () =>
                                            fetch(
                                                `http://localhost:8080/api/events/${eventId}/setClosed`,
                                                {method: "PATCH"}
                                            ),
                                        "Event closed!",
                                        "Failed to close event."
                                    )
                                }
                                className={buttonClass}
                            >
                                Close Event
                            </button>
                            <button
                                onClick={() =>
                                    handleAction(
                                        () =>
                                            fetch(
                                                `http://localhost:8080/api/events/${eventId}/setPublic`,
                                                {method: "PATCH"}
                                            ),
                                        "Event made public!",
                                        "Failed to make event public."
                                    )
                                }
                                className={buttonClass}
                            >
                                Make Public
                            </button>
                        </div>

                        <div className="space-y-3">
                            <label htmlFor="new-password" className="block text-sm text-zinc-300 mb-1">
                                Set Private Password:
                            </label>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    id="new-password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className={`${inputClass} sm:w-2/3`}
                                />
                                <button onClick={handleSetPrivate} className={buttonClass}>
                                    Make Private
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label htmlFor="select-winner" className="block text-sm text-zinc-300 mb-1">
                                Mark as Finished:
                            </label>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <select
                                    id="select-winner"
                                    value={winnersAction}
                                    onChange={(e) => setWinnersAction(e.target.value)}
                                    className={`${selectClass} sm:w-2/3`}
                                >
                                    <option value="">Select winning action</option>
                                    {event.actions.map((a) => (
                                        <option key={a.actionId} value={a.action}>
                                            {a.action}
                                        </option>
                                    ))}
                                </select>
                                <button onClick={handleSetFinished} className={buttonClass}>
                                    Mark as Finished
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {!isCreator && !event.isFinished && event.isOpen && (
                    <div className={adminSectionClass}>
                        <h3 className="font-bold text-2xl text-white text-center">
                            Join Event
                        </h3>
                        {!event.isPublic && (
                            <div className="mb-4">
                                <label
                                    htmlFor="event-password"
                                    className="block text-sm text-zinc-300 mb-1"
                                >
                                    Event Password:
                                </label>
                                <input
                                    id="event-password"
                                    type="password"
                                    className={inputClass}
                                    value={passwordInput}
                                    onChange={(e) => setPasswordInput(e.target.value)}
                                    placeholder="Enter event password"
                                />
                            </div>
                        )}

                        <form onSubmit={handleJoin} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="select-choice"
                                    className="block text-sm text-zinc-300 mb-1"
                                >
                                    Your Choice:
                                </label>
                                <select
                                    id="select-choice"
                                    required
                                    value={form.choice}
                                    onChange={(e) =>
                                        setForm({ ...form, choice: e.target.value })
                                    }
                                    className={selectClass}
                                >
                                    <option value="">Select Your Action</option>
                                    {event.actions.map((a) => (
                                        <option key={a.actionId} value={a.action}>
                                            {a.action}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label
                                    htmlFor="stake-input"
                                    className="block text-sm text-zinc-300 mb-1"
                                >
                                    Your Stake ($):
                                </label>
                                <input
                                    id="stake-input"
                                    required
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    placeholder="Enter your stake"
                                    value={form.stake}
                                    onChange={(e) =>
                                        setForm({ ...form, stake: e.target.value })
                                    }
                                    className={inputClass}
                                />
                            </div>
                            <button type="submit" className={buttonClass}>
                                Join Event
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
