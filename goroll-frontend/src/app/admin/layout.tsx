// src/app/admin/layout.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import {
  LayoutDashboard,
  MapPin,
  AlertTriangle,
  Users,
  // MessageSquare,
  // Settings,
  LogOut,
  Menu,
  X,
  FileText,
  Route as RouteIcon,
  Bell, 
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { getCookie } from "cookies-next";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileNav, setIsMobileNav] = useState(false);

  const token = getCookie("token");
  const isAuthenticated = useAuthStore((state) => state.authenticated);
  const setIsAuthenticated = useAuthStore((state) => state.setAuthentication);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);

      if (!user) {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
    } else {
      setIsAuthenticated(false);
      router.replace("/admin/login");
    }
    setIsLoading(false);
  }, [token, setIsAuthenticated, router, setUser, user]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width < 768) {
        setIsSidebarOpen(false);
        setIsMobileNav(true);
      } else {
        setIsMobileNav(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleLogout = () => {
    document.cookie = "token=; Max-Age=0; path=/;";
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    router.push("/admin/login");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ถ้าเป็นหน้า login ให้แสดงเฉพาะ children โดยไม่มี layout
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // ถ้าเข้าสู่ระบบสำเร็จ แสดง Layout สำหรับ Admin
  if (isAuthenticated) {
    return (
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar ที่สามารถย่อและขยายได้ */}
        <aside
          className={`flex-none flex flex-col justify-between h-screen min-h-full overflow-auto bg-gray-800 text-white ${
            !isSidebarOpen && !isMobileNav ? "w-20" : "w-64"
          } ${isMobileNav && "fixed top-0 left-0 h-full z-[20]"} ${
            isMobileNav && isSidebarOpen && "translate-x-0"
          } ${
            isMobileNav && !isSidebarOpen && "-translate-x-full"
          } transition-all duration-300`}
        >
          <div>
            <div className="p-4 flex items-center justify-between">
              {isSidebarOpen ? (
                <Link href="/admin/dashboard" className="flex items-center">
                  <Logo
                    isHref={false}
                    showText={false}
                    size="small"
                    className="mr-2"
                  />
                  <span className="font-bold text-xl">GOROLL Admin</span>
                </Link>
              ) : (
                <Link href="/admin/dashboard" className="mx-auto">
                  <Logo isHref={false} showText={false} size="small" />
                </Link>
              )}
              {isMobileNav && (
                <button
                  onClick={() => setIsSidebarOpen((prev) => !prev)}
                  className="text-gray-300 hover:text-white"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            <nav className="mt-6">
              <ul className="space-y-1">
                {[
                  {
                    title: "แดชบอร์ด",
                    href: "/admin/dashboard",
                    icon: <LayoutDashboard size={20} />,
                  },
                  {
                    title: "จัดการสถานที่",
                    href: "/admin/locations",
                    icon: <MapPin size={20} />,
                  },
                  {
                    title: "จัดการอุปสรรค",
                    href: "/admin/obstacles",
                    icon: <AlertTriangle size={20} />,
                  },
                  {
                    title: "จัดการเส้นทาง", // เพิ่มเมนูเส้นทาง
                    href: "/admin/routes",
                    icon: <RouteIcon size={20} />,
                  },
                  {
                    title: "จัดการโพสต์",
                    href: "/admin/posts",
                    icon: <FileText size={20} />,
                  },
                  {
                    title: "จัดการผู้ใช้",
                    href: "/admin/users",
                    icon: <Users size={20} />,
                  },
                  {
                    title: "กิจกรรมล่าสุด",
                    href: "/admin/activities",
                    icon: <Bell size={20} />,
                  },
                  // {
                  //   title: "รีวิวและความคิดเห็น",
                  //   href: "/admin/reviews",
                  //   icon: <MessageSquare size={20} />,
                  // },
                  // {
                  //   title: "ตั้งค่าระบบ",
                  //   href: "/admin/settings",
                  //   icon: <Settings size={20} />,
                  // },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-4 py-3 ${
                        pathname === item.href ||
                        pathname.startsWith(item.href + "/")
                          ? "bg-blue-600"
                          : "hover:bg-gray-700"
                      } ${isSidebarOpen ? "justify-start" : "justify-center"}`}
                    >
                      <span>{item.icon}</span>
                      {isSidebarOpen && (
                        <span className="ml-3">{item.title}</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="p-4">
            <button
              onClick={handleLogout}
              className={`flex items-center text-red-300 hover:text-red-400 ${
                isSidebarOpen ? "justify-start" : "justify-center"
              } w-full px-4 py-3 transition-colors`}
            >
              <LogOut size={20} />
              {isSidebarOpen && <span className="ml-3">ออกจากระบบ</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main
          className={`w-full flex flex-col overflow-x-hidden`}
          // className={`flex-1 overflow-auto transition-all duration-300 ${
          //   isSidebarOpen ? "ml-64" : "ml-20"
          // }`}
        >
          {/* Header */}
          <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="text-black"
                >
                  <Menu size={20} />
                </button>
                <h1 className="text-xl font-semibold text-gray-800">
                  ระบบผู้ดูแล GOROLL
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.fullName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                      A
                    </div>
                  )}
                  <span className="ml-2 font-medium">{user?.fullName ?? "Admin"}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="grow p-6 overflow-y-auto">{children}</div>
        </main>
      </div>
    );
  }

  // กรณีไม่ได้เข้าสู่ระบบ แต่ยัง loading อยู่
  return null;
}
