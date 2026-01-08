"use client";

import { useState, useEffect } from "react";
import { Logo } from "@/components/Logo";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { setCookie } from "cookies-next";
import { handleAxiosError } from "@/services/api/api";
import { handleLogin } from "@/services/api/endpoints/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuthentication = useAuthStore((state) => state.setAuthentication);
  const authenticated = useAuthStore((state) => state.authenticated);
  const loginInState = useAuthStore((state) => state.login);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await handleLogin(formData.email, formData.password);
      const { accessToken, user } = res;

      setAuthentication(true);
      loginInState(accessToken, { ...user, avatar: user.avatarUrl ?? null });
      setCookie("token", accessToken);

      localStorage.setItem("user", JSON.stringify(user));

      // router.replace("/admin/dashboard");
    } catch (error) {
      const err = handleAxiosError(error);
      if (err.status === 401) {
        setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      } else {
        setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      }
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated) {
      router.replace("/admin/dashboard");
    }
  }, [authenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size="medium" />
        </div>

        <h1 className="text-2xl font-bold text-center mb-6">
          เข้าสู่ระบบผู้ดูแล
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              ชื่อผู้ใช้
            </label>
            <input
              id="email"
              name="email"
              type="text"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="ป้อนชื่อผู้ใช้"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              รหัสผ่าน
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="ป้อนรหัสผ่าน"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 rounded-md text-white font-medium ${
              loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
      </div>
    </div>
  );
}
