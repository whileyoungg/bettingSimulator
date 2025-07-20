import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    FaUserCircle,
    FaWallet,
    FaPlusCircle,
    FaSignInAlt,
    FaUserPlus,
    FaExclamationCircle,
    FaSignOutAlt,
} from "react-icons/fa";

export default function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState("");
    const [balance, setBalance] = useState("0.00");
    const [isVerified, setIsVerified] = useState(true);

    const navigate = useNavigate();

    const checkUserSession = () => {
        const userStr = sessionStorage.getItem("loggedInUser");
        if (!userStr) {
            setIsLoggedIn(false);
            setUsername("");
            setBalance("0.00");
            setIsVerified(true);
            return;
        }

        try {
            const user = JSON.parse(userStr);
            setIsLoggedIn(true);
            setUsername(user.username);
            setBalance(parseFloat(user.balance).toFixed(2));
            setIsVerified(user.isVerified);
        } catch (err) {
            console.error("Failed to parse user from session storage:", err);
            setIsLoggedIn(false);
        }
    };
    const checkDeposits = async () => {
        const userStr = sessionStorage.getItem("loggedInUser");
        if (!userStr) return;

        const user = JSON.parse(userStr);
        const username = user.username;

        try {
            // PATCH to update deposits
            await fetch("http://localhost:8080/api/deposit", { method: "PATCH" });

            // ✅ NEW: PATCH to update withdrawals
            await fetch("http://localhost:8080/api/withdraw", { method: "PATCH" });

            // Refresh user data
            const userRes = await fetch(`http://localhost:8080/api/sessionUpdate?username=${username}`);
            if (!userRes.ok) {
                console.warn("Failed to fetch updated user session");
                return;
            }
            const userData = await userRes.json();
            setBalance(parseFloat(userData.balance).toFixed(2));
            setIsVerified(userData.isVerified);
            setUsername(userData.username);
            sessionStorage.setItem("loggedInUser", JSON.stringify(userData));
        } catch (error) {
            console.error("Error during deposit/withdrawal update:", error);
        }
    };
    useEffect(() => {
        checkUserSession();
        checkDeposits();

        const interval = setInterval(() => {
            checkUserSession();
            checkDeposits();
        }, 70000);

        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem("loggedInUser");
        sessionStorage.removeItem("loggedUsername");
        setIsLoggedIn(false);
        setUsername("");
        setBalance("0.00");
        setIsVerified(true);
        navigate("/login");
    };

    return (
        <nav className="bg-zinc-900 text-zinc-300 px-6 py-4 flex flex-col md:flex-row justify-between items-center shadow-lg border-b border-zinc-700">
            <Link
                to="/"
                className="text-3xl font-extrabold tracking-tight font-orbitron mb-4 md:mb-0"
            >
                <span className="text-blue-500">BETTING</span>
                <span className="text-teal-400">SIMULATOR</span>
            </Link>


            <div className="flex flex-wrap justify-center md:justify-end items-center gap-4 md:gap-6 text-lg">
                <Link
                    to="/createEvent"
                    className="flex items-center gap-2 hover:text-blue-400 transition-colors duration-200"
                >
                    <FaPlusCircle className="text-xl" />
                    Create Event
                </Link>

                {isLoggedIn ? (
                    <>

                        <div className="relative group">
                            <Link
                                to={`/users/${username}`}
                                className="flex items-center gap-2 hover:text-blue-400 transition-colors duration-200"
                            >
                                <FaUserCircle className="text-xl" />
                                <span className="font-semibold">{username}</span>
                                {!isVerified && (
                                    <Link
                                        to="/verification"
                                        className="bg-red-700 text-white text-xs px-2 py-1 rounded-full ml-1 font-semibold hover:bg-red-600 transition-colors duration-200 flex items-center gap-1"
                                    >
                                        <FaExclamationCircle /> Verify
                                    </Link>
                                )}
                            </Link>
                            {!isVerified && (
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-zinc-700 text-zinc-200 text-sm px-4 py-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-20 border border-zinc-600">
                                    Your account is not verified.
                                    <br />
                                    <Link
                                        to="/verification"
                                        className="text-blue-400 hover:underline mt-1 block"
                                    >
                                        Verify now
                                    </Link>
                                </div>
                            )}
                        </div>

                        <div className="relative group flex items-center bg-zinc-700 px-3 py-1.5 rounded-lg shadow-inner cursor-pointer hover:bg-zinc-600 transition-colors duration-200">
                            <FaWallet className="text-xl text-teal-400 mr-2" />
                            <span className="font-semibold text-white">{balance}€</span>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-zinc-700 text-zinc-200 text-sm px-4 py-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-20 border border-zinc-600">
                                Top up via Monobank
                                <br />
                                <a
                                    href="https://send.monobank.ua/jar/AYau3UrT6e"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:underline mt-1 block"
                                >
                                    Click to donate (comment your username)
                                </a>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-red-400 hover:text-red-500 transition-colors duration-200"
                        >
                            <FaSignOutAlt className="text-xl" />
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link
                            to="/login"
                            className="flex items-center gap-2 hover:text-blue-400 transition-colors duration-200"
                        >
                            <FaSignInAlt className="text-xl" />
                            Login
                        </Link>
                        <Link
                            to="/registration"
                            className="flex items-center gap-2 hover:text-blue-400 transition-colors duration-200"
                        >
                            <FaUserPlus className="text-xl" />
                            Register
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}