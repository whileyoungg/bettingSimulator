import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        isPublic: "",
        isOpen: "",
        isFinished: "",
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        setLoading(true);
        setError("");
        fetch("http://localhost:8080/api/events")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch events");
                return res.json();
            })
            .then((data) => {
                setEvents(data);
                setFilteredEvents(data);
            })
            .catch((err) => {
                console.error("Error fetching events:", err);
                setError("Failed to load events. Please try again later.");
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        let filtered = [...events];

        if (searchTerm) {
            filtered = filtered.filter((e) =>
                e.event.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filters.isPublic !== "") {
            filtered = filtered.filter(
                (e) => e.isPublic === (filters.isPublic === "true")
            );
        }

        if (filters.isOpen !== "") {
            filtered = filtered.filter(
                (e) => e.isOpen === (filters.isOpen === "true")
            );
        }

        if (filters.isFinished !== "") {
            filtered = filtered.filter(
                (e) => e.isFinished === (filters.isFinished === "true")
            );
        }

        setFilteredEvents(filtered);
    }, [searchTerm, filters, events]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const inputClass =
        "w-full p-3 rounded-lg bg-zinc-700 text-white placeholder-zinc-400 border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500";
    const selectClass =
        "w-full p-3 rounded-lg bg-zinc-700 text-white border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500";

    return (
        <div className="min-h-screen flex flex-col items-center py-8 bg-zinc-900 px-4">
            <div className="w-full max-w-5xl bg-zinc-800 p-8 rounded-2xl shadow-2xl border border-zinc-700 space-y-6">
                <h1 className="text-4xl font-extrabold text-white text-center mb-6">
                    All Events
                </h1>

                {error && (
                    <div className="bg-red-600 text-white px-4 py-3 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                {/* Search and Filters */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Search by event name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`${inputClass} col-span-1 md:col-span-2`}
                    />

                    <select
                        name="isPublic"
                        value={filters.isPublic}
                        onChange={handleFilterChange}
                        className={selectClass}
                    >
                        <option value="">Public?</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>

                    <select
                        name="isOpen"
                        value={filters.isOpen}
                        onChange={handleFilterChange}
                        className={selectClass}
                    >
                        <option value="">Open?</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>

                    <select
                        name="isFinished"
                        value={filters.isFinished}
                        onChange={handleFilterChange}
                        className={selectClass}
                    >
                        <option value="">Finished?</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                </div>

                {loading ? (
                    <p className="text-zinc-300 text-center text-lg">Loading events...</p>
                ) : filteredEvents.length === 0 ? (
                    <p className="text-zinc-300 text-center text-lg">No events found.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEvents.map((event) => (
                            <Link
                                to={`/events/${event.eventId}`}
                                key={event.eventId}
                                className="block"
                            >
                                <div className="bg-zinc-800 p-6 rounded-xl shadow-md border border-zinc-700 hover:border-blue-500 transition-all duration-200 h-full flex flex-col justify-between">
                                    <div>
                                        <h2 className="text-xl font-semibold text-white mb-2">
                                            {event.event}
                                        </h2>

                                        <div className="mb-2">
                                            <p className="text-white font-medium">Actions:</p>
                                            <ul className="text-zinc-300 list-disc list-inside space-y-1">
                                                {event.actions?.map((a, idx) => (
                                                    <li key={idx}>
                                                        {a.action}{" "}
                                                        <span className="text-blue-400 font-semibold">
                                                            ({a.coefficient})
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <p className="text-zinc-300">
                                            <strong className="text-white">Budget:</strong> ${event.budget}
                                        </p>
                                        <p className="text-zinc-300">
                                            <strong className="text-white">Limit:</strong>{" "}
                                            {event.playerLimit} players, ${event.stakeLimit} stake
                                        </p>
                                    </div>

                                    <div className="mt-4 text-sm space-y-1">
                                        <p>
                                            <strong className="text-white">Public:</strong>{" "}
                                            <span className={event.isPublic ? "text-green-500" : "text-yellow-500"}>
                                                {event.isPublic ? "Yes" : "No"}
                                            </span>
                                        </p>
                                        <p>
                                            <strong className="text-white">Open:</strong>{" "}
                                            <span className={event.isOpen ? "text-green-500" : "text-red-500"}>
                                                {event.isOpen ? "Yes" : "No"}
                                            </span>
                                        </p>
                                        <p>
                                            <strong className="text-white">Finished:</strong>{" "}
                                            <span className={event.isFinished ? "text-red-500" : "text-green-500"}>
                                                {event.isFinished ? "Yes" : "No"}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;