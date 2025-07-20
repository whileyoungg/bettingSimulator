import { useState } from "react";
import { useNavigate} from "react-router-dom";
export default function RegisterPage() {
    const [form, setForm] = useState({ username: "", email: "" ,password: ""});
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const handleChange = (e: { target: { name: any; value: any; }; }) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const navigate = useNavigate();
    const handleRegister = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        try {
            const res = await fetch("http://localhost:8080/api/registration", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const contentType = res.headers.get("content-type");
            const hasJson = contentType && contentType.includes("application/json");

            if (!res.ok) {
                const errorData = hasJson ? await res.json() : null;
                setError(errorData?.error || "Registration failed");
                return;
            }

            const user = hasJson ? await res.json() : null;
            console.log("Registered user:", user);
            navigate("/login");
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-900 p-4 gap-16">
            <form
                onSubmit={handleRegister}
                className="bg-zinc-800 p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-zinc-700 space-y-5"
            >
                <h2 className="text-3xl font-extrabold white mb-6 text-center">
                    Join Us
                </h2>

                {error && (
                    <div
                        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm"
                        role="alert"
                    >
                        {error}
                    </div>
                )}
                {success && (
                    <div
                        className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 text-sm"
                        role="alert"
                    >
                        {success}
                    </div>
                )}

                <div className="mb-4">
                    <label
                        htmlFor="username"
                        className="block text-sm font-medium white mb-1"
                    >
                        Username
                    </label>
                    <input
                        id="username"
                        className="w-full p-3 rounded-lg bg-zinc-700 text-white placeholder-zinc-400 border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Choose a username"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-4">
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium white mb-1"
                    >
                        Email Address
                    </label>
                    <input
                        id="email"
                        className="w-full p-3 rounded-lg bg-zinc-700 text-white placeholder-zinc-400 border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="email"
                        placeholder="you@example.com"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-6">
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium white mb-1"
                    >
                        Password
                    </label>
                    <input
                        id="password"
                        className="w-full p-3 rounded-lg bg-zinc-700 text-white placeholder-zinc-400 border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="password"
                        placeholder="At least 8 characters"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        minLength={8}
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-950 text-white p-3 rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-950 focus:ring-opacity-50 transition-all duration-200 ease-in-out font-semibold text-lg shadow-md"
                >
                    Register Account
                </button>
            </form>
        </div>
    );
}
