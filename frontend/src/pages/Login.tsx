import {useEffect, useState} from "react";
export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loggedInUser, setLoggedInUser] = useState<null | {
        username: string;
        email: string;
        balance: number;
        isVerified: boolean;
    }>(null);
    useEffect(() => {
        const savedUser = sessionStorage.getItem("loggedInUser");
        if (savedUser) {
            setLoggedInUser(JSON.parse(savedUser));
        }
    }, []);
    const handleLogin = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("http://localhost:8080/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error("Login failed");
            }

            const user = await res.json();
            console.log("Logged in as:", user);
            sessionStorage.setItem("loggedInUser", JSON.stringify(user));
            sessionStorage.setItem("loggedUsername", user.username);
            setLoggedInUser(user);
            window.location.href = '/';

        } catch (err) {
            // @ts-ignore
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-900 px-4">


            <form
                onSubmit={handleLogin}
                    className="bg-zinc-800 p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-zinc-700 space-y-5"
            >
                <h2 className="text-3xl font-bold text-white text-center mb-2">Sign In</h2>

                {error && (
                    <div className="bg-red-500 text-white px-4 py-2 rounded text-sm text-center">
                        {error}
                    </div>
                )}

                <div>
                    <label htmlFor="login-username" className="block text-sm text-zinc-300 mb-1">
                        Username
                    </label>
                    <input
                        id="login-username"
                        className="w-full p-3 rounded-lg bg-zinc-700 text-white placeholder-zinc-400 border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="login-password" className="block text-sm text-zinc-300 mb-1">
                        Password
                    </label>
                    <input
                        id="login-password"
                        type="password"
                        className="w-full p-3 rounded-lg bg-zinc-700 text-white placeholder-zinc-400 border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-semibold text-lg transition duration-200"
                >
                    Sign In
                </button>
            </form>
        </div>

    );
}