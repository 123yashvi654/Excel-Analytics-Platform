import React, { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = () => {
    // This would call your backend later — for now show dummy success
    if (email) {
      setMessage("📧 Password reset instructions sent to your email.");
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center p-4">
      <div className="bg-white text-black rounded-lg p-6 w-full max-w-md shadow-md">
        <h2 className="text-2xl font-bold text-center mb-4">Forgot your password?</h2>
        <p className="text-sm text-center text-gray-600 mb-4">
          Enter your email and we’ll send you reset instructions.
        </p>
        <input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 border px-4 py-2 rounded-md"
        />
        <button
          onClick={handleReset}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Reset Password
        </button>
        {message && <p className="text-green-600 text-sm mt-4 text-center">{message}</p>}
      </div>
    </div>
  );
}
