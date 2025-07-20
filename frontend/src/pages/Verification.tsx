import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function VerificationForm() {
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        bsn: "",
        iban: "",
        address: "",
        postalCode: "",
        phoneNumber: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [username, setUsername] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const saved = sessionStorage.getItem("loggedInUser");
        if (!saved) {
            navigate("/login");
            return;
        }
        const user = JSON.parse(saved);
        setUsername(user.username);
    }, [navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        const payload = {
            username,
            ...form,
            bsn: parseInt(form.bsn),
            phoneNumber: parseInt(form.phoneNumber)
        };

        try {
            const res = await fetch("http://localhost:8080/api/verification", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text);
            }

            setSuccess(true);
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-900 p-4 text-white">
            {!success ? (
                <form
                    onSubmit={handleSubmit}
                    className="bg-zinc-800 p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-zinc-700 space-y-5"
                >
                    <h2 className="text-2xl font-bold text-center">Identity Verification</h2>

                    {error && <div className="bg-red-500 text-white px-4 py-2 rounded">{error}</div>}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                            name="firstName"
                            placeholder="First Name"
                            className="p-3 rounded bg-zinc-700 text-white"
                            value={form.firstName}
                            onChange={handleChange}
                            required
                        />
                        <input
                            name="lastName"
                            placeholder="Last Name"
                            className="p-3 rounded bg-zinc-700 text-white"
                            value={form.lastName}
                            onChange={handleChange}
                            required
                        />
                        <input
                            name="bsn"
                            placeholder="BSN"
                            className="p-3 rounded bg-zinc-700 text-white"
                            value={form.bsn}
                            onChange={handleChange}
                            required
                        />
                        <input
                            name="iban"
                            placeholder="IBAN (e.g., NL91ABNA0417164300)"
                            className="p-3 rounded bg-zinc-700 text-white"
                            value={form.iban}
                            onChange={handleChange}
                            required
                        />
                        <input
                            name="address"
                            placeholder="Address"
                            className="p-3 rounded bg-zinc-700 text-white col-span-full"
                            value={form.address}
                            onChange={handleChange}
                            required
                        />
                        <input
                            name="postalCode"
                            placeholder="Postal Code (e.g., 1234 AB)"
                            className="p-3 rounded bg-zinc-700 text-white"
                            value={form.postalCode}
                            onChange={handleChange}
                            required
                        />
                        <input
                            name="phoneNumber"
                            placeholder="Phone Number (e.g., 0612345678)"
                            type="tel"
                            className="p-3 rounded bg-zinc-700 text-white"
                            value={form.phoneNumber}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold text-lg transition duration-200"
                    >
                        Submit Verification
                    </button>
                </form>
            ) : (
                <div className="bg-zinc-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-zinc-700 text-center space-y-6">
                    <h2 className="text-2xl font-bold text-green-400">Verification submitted!</h2>
                    <p className="text-zinc-300">Your verification data has been submitted successfully. Our team will review it shortly.</p>
                    <button
                        onClick={() => navigate("/")}
                        className="bg-green-600 hover:bg-green-500 text-white py-3 px-6 rounded-lg font-semibold text-lg transition duration-200"
                    >
                        Go to Home
                    </button>
                </div>
            )}
        </div>
    );
}
