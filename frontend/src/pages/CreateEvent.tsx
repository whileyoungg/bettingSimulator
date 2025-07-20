import { useEffect, useState } from "react";

export default function CreateEventForm() {
    const [form, setForm] = useState({
        event: "",
        actions: [{ action: "", coefficient: 1.0 }],
        budget: 0.0,
        stakeLimit: 0.0,
        playerLimit: 0,
        isOpen: true,
        isFinished: false,
        isPublic: true,
        creator: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        // @ts-ignore
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : type === "number" ? parseFloat(value) || 0 : value
        }));
    };

    const handleActionChange = (index: number, field: "action" | "coefficient", value: string | number) => {
        setForm(prev => {
            const updated = [...prev.actions];
            updated[index] = {
                ...updated[index],
                [field]: field === "coefficient" ? parseFloat(value as string) || 0 : value
            };
            return { ...prev, actions: updated };
        });
    };

    const addAction = () => {
        setForm(prev => ({
            ...prev,
            actions: [...prev.actions, { action: "", coefficient: 1.0 }]
        }));
    };

    const removeAction = (index: number) => {
        setForm(prev => ({
            ...prev,
            actions: prev.actions.filter((_, i) => i !== index)
        }));
    };

    useEffect(() => {
        const { budget, actions, playerLimit } = form;
        const maxCoeff = Math.max(...actions.map(a => a.coefficient || 0));
        if (maxCoeff > 0 && playerLimit > 0) {
            const limit = (budget / playerLimit) / maxCoeff;
            setForm(prev => ({ ...prev, stakeLimit: parseFloat(limit.toFixed(2)) }));
        } else {
            setForm(prev => ({ ...prev, stakeLimit: 0 }));
        }
    }, [form.budget, form.actions, form.playerLimit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const saved = sessionStorage.getItem("loggedInUser");
        if (!saved) {
            setError("User is not logged in. Cannot create event.");
            return;
        }

        let user;
        try {
            user = JSON.parse(saved);
        } catch {
            setError("Failed to parse user session.");
            return;
        }

        const formData = {
            ...form,
            creator: user.username,
            password: form.isPublic ? "" : form.password
        };

        try {
            const res = await fetch("http://localhost:8080/api/createEvent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                setError("Failed to create event");
                return;
            }

            setSuccess("Event created successfully!");
            setForm({
                event: "",
                actions: [{ action: "", coefficient: 1.0 }],
                budget: 0.0,
                stakeLimit: 0.0,
                playerLimit: 0,
                isOpen: true,
                isFinished: false,
                isPublic: true,
                creator: user.username,
                password: ""
            });
            console.log(JSON.stringify(formData));
        } catch (err: any) {
            setError(err.message || "Unexpected error");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-900 p-6">
            <form onSubmit={handleSubmit} className="bg-zinc-800 p-6 rounded-xl shadow-md w-full max-w-md space-y-4">
                <h2 className="text-2xl font-bold text-center text-white">Create Event</h2>
                {error && <div className="text-red-500 text-sm">{error}</div>}
                {success && <div className="text-green-500 text-sm">{success}</div>}

                <input
                    name="event"
                    value={form.event}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    placeholder="Event Name"
                    required
                />

                <div className="space-y-4">
                    {form.actions.map((a, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <input
                                type="text"
                                placeholder={`Action ${index + 1}`}
                                value={a.action}
                                onChange={e => handleActionChange(index, "action", e.target.value)}
                                className="flex-1 p-2 border rounded"
                                required
                            />
                            <input
                                type="number"
                                step="0.01"
                                placeholder="Coefficient"
                                value={a.coefficient}
                                onChange={e => handleActionChange(index, "coefficient", e.target.value)}
                                className="w-32 p-2 border rounded"
                                required
                            />
                            {form.actions.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeAction(index)}
                                    className="text-red-500 hover:underline"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addAction}
                        className="text-blue-500 hover:underline mt-2"
                    >
                        + Add Action
                    </button>
                </div>

                <input
                    type="number"
                    step="0.01"
                    id="budget"
                    name="budget"
                    value={form.budget}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    placeholder="Budget"
                    required
                />

                <input
                    type="number"
                    id="playerLimit"
                    name="playerLimit"
                    value={form.playerLimit}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    placeholder="Player Limit"
                    required
                />

                <div className="text-sm text-gray-200">
                    Stake limit (auto-calculated): <strong>{form.stakeLimit}</strong>
                </div>

                <div className="flex justify-between space-x-4">
                    <label className="flex items-center text-white">
                        <input
                            type="checkbox"
                            name="isOpen"
                            checked={form.isOpen}
                            onChange={handleChange}
                            className="mr-2"
                        />
                        Open
                    </label>
                    <label className="flex items-center text-white">
                        <input
                            type="checkbox"
                            name="isPublic"
                            checked={form.isPublic}
                            onChange={handleChange}
                            className="mr-2"
                        />
                        Public
                    </label>
                </div>

                {!form.isPublic && (
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        placeholder="Event Password"
                        required
                    />
                )}

                <button
                    type="submit"
                    className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 font-semibold"
                >
                    Create Event
                </button>
            </form>
        </div>
    );
}
