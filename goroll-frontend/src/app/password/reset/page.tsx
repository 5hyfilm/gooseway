"use client";

import { useEffect, useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock } from "lucide-react";
import { resetPassword } from "@/services/api/endpoints/auth";
import { validatePassword } from "@/data/users";

function ResetPasswordComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: true,
    isValidLength: true,
    hasUppercase: true,
    hasLowercase: true,
    hasNumber: true,
    hasSpecialChar: true,
    typesCount: 0,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const urlToken = searchParams.get("token") ?? "";
    setToken(urlToken);
  }, [searchParams]);

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await resetPassword(token, newPassword);
      setSuccess(response.message);
      setError("");
      router.replace("/password/success");
    } catch (err) {
      console.error("Error resetting password:", err);
      alert("เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white px-4 sm:px-6 lg:px-8">
      <form
        onSubmit={handleResetPassword}
        className="w-full max-w-sm sm:max-w-md bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-md"
      >
        <div className="mb-4 sm:mb-6 text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">Create a new password</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Your new password must be different from the last one
          </p>
        </div>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        {success && <p className="text-green-500 mb-4 text-sm">{success}</p>}

        <div className="mt-6 sm:mt-10 space-y-4 sm:space-y-6">
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={16} className="text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  const validation = validatePassword(e.target.value);
                  setPasswordValidation(validation);
                }}
                required
                className="w-full pl-10 pr-10 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {!passwordValidation.isValid && (
              <div className="text-red-500 text-xs mt-2 leading-tight">
                รหัสผ่านต้องมีความยาว 8-20 ตัวอักษร และมีอย่างน้อย 2 ประเภท
                (ตัวพิมพ์ใหญ่, ตัวพิมพ์เล็ก, ตัวเลข, อักขระพิเศษ)
              </div>
            )}
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={16} className="text-gray-400" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 focus:outline-none"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {newPassword &&
              confirmPassword &&
              newPassword !== confirmPassword && (
                <div className="text-red-500 text-xs mt-2">
                  รหัสผ่านไม่ตรงกัน
                </div>
              )}
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white px-4 py-2 sm:py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-6 sm:mt-10 text-sm sm:text-base transition-colors ${
          loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
          }`}

        >
        {loading ? "Reset Password..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordComponent />
    </Suspense>
  );
}
