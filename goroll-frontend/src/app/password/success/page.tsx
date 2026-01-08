"use client";

import { CircleCheck } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white px-4">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md md:p-8">
        <CircleCheck className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4 text-center">
          Password Reset Successful!
        </h2>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Your password has been changed successfully. You can now log in with
          your new password.
        </p>
        <button
          onClick={() => (window.location.href = "com.hod.goroll://")}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Back to My App
        </button>{" "}
      </div>
    </div>
  );
}
