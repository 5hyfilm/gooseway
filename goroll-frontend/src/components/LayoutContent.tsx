// src/components/LayoutContent.tsx
"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/NavBar";
// import { useLanguage } from "../../contexts/LanguageContext";

export default function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // const { t } = useLanguage(); // Added for potential future translations

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password";

  // เพิ่มเงื่อนไขตรวจสอบว่าเป็นหน้า admin หรือไม่
  const isAdminPage = pathname?.startsWith("/admin");

  return (
    <div className="flex h-screen flex-col">
      <main className="flex-1">{children}</main>
      {!isAuthPage && !isAdminPage && <Navbar />}
    </div>
  );
}
