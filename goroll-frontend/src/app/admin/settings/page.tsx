// src/app/admin/settings/page.tsx

"use client";

import { useState } from "react";
import {
  Save,
  Mail,
  Bell,
  Database,
  Cpu,
  Shield,
  RefreshCw,
  CloudUpload,
  ShieldAlert,
  X,
  Globe,
} from "lucide-react";

// Define types for settings
interface GeneralSettings {
  appName: string;
  supportEmail: string;
  showPrototypeNotice: boolean;
  languageOptions: string[];
  defaultLanguage: string;
}

interface NotificationSettings {
  enableEmailNotifications: boolean;
  notifyOnNewUser: boolean;
  notifyOnNewObstacle: boolean;
  notifyOnNewLocation: boolean;
  batchNotifications: boolean;
  dailySummary: boolean;
  weeklyReport: boolean;
}

interface SecuritySettings {
  requireStrongPasswords: boolean;
  passwordExpiryDays: number;
  maxLoginAttempts: number;
  sessionTimeoutMinutes: number;
  twoFactorAuth: boolean;
  adminApprovalForNewModerators: boolean;
}

interface BackupSettings {
  autoBackup: boolean;
  backupFrequency: string;
  keepBackupDays: number;
  includeImages: boolean;
  backupLocation: string;
}

export default function AdminSettings() {
  // Stateful settings with type annotations
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    appName: "GOROLL",
    supportEmail: "support@goroll.com",
    showPrototypeNotice: true,
    languageOptions: ["en", "th"],
    defaultLanguage: "th",
  });

  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>({
      enableEmailNotifications: true,
      notifyOnNewUser: true,
      notifyOnNewObstacle: true,
      notifyOnNewLocation: false,
      batchNotifications: true,
      dailySummary: true,
      weeklyReport: true,
    });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    requireStrongPasswords: true,
    passwordExpiryDays: 90,
    maxLoginAttempts: 5,
    sessionTimeoutMinutes: 30,
    twoFactorAuth: false,
    adminApprovalForNewModerators: true,
  });

  const [backupSettings, setBackupSettings] = useState<BackupSettings>({
    autoBackup: true,
    backupFrequency: "daily",
    keepBackupDays: 30,
    includeImages: true,
    backupLocation: "cloud",
  });

  // Stateful UI settings
  const [saving, setSaving] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("general");
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [confirmAction, setConfirmAction] = useState<string>("");

  // Type-safe handler functions with explicit type annotations
  const handleGeneralSettingChange = <K extends keyof GeneralSettings>(
    field: K,
    value: GeneralSettings[K]
  ) => {
    setGeneralSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNotificationSettingChange = <
    K extends keyof NotificationSettings
  >(
    field: K,
    value: NotificationSettings[K]
  ) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSecuritySettingChange = <K extends keyof SecuritySettings>(
    field: K,
    value: SecuritySettings[K]
  ) => {
    setSecuritySettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBackupSettingChange = <K extends keyof BackupSettings>(
    field: K,
    value: BackupSettings[K]
  ) => {
    setBackupSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Async function for saving settings
  const handleSaveSettings = async () => {
    setSaving(true);

    // Simulate saving data
    await new Promise<void>((resolve) => setTimeout(resolve, 1500));

    setSaving(false);
    setShowSuccess(true);

    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  // Function to open confirmation modal
  const openConfirmation = (action: string) => {
    setConfirmAction(action);
    setShowConfirmation(true);
  };

  // Async function for system actions
  const handleSystemAction = async () => {
    setShowConfirmation(false);
    setSaving(true);

    // Simulate processing
    await new Promise<void>((resolve) => setTimeout(resolve, 2000));

    setSaving(false);
    setShowSuccess(true);

    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  // Tab configuration with type-safe icon and label
  const tabs: Array<{ id: string; label: string; icon: React.ReactNode }> = [
    { id: "general", label: "ทั่วไป", icon: <Globe size={20} /> },
    { id: "notifications", label: "การแจ้งเตือน", icon: <Bell size={20} /> },
    { id: "security", label: "ความปลอดภัย", icon: <Shield size={20} /> },
    { id: "backup", label: "สำรองข้อมูล", icon: <Database size={20} /> },
    { id: "system", label: "ระบบ", icon: <Cpu size={20} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">ตั้งค่าระบบ</h1>
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className={`px-6 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2 ${
            saving ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
        >
          {saving ? (
            <>
              <RefreshCw size={18} className="animate-spin" />
              <span>กำลังบันทึก...</span>
            </>
          ) : (
            <>
              <Save size={18} />
              <span>บันทึกการตั้งค่า</span>
            </>
          )}
        </button>
      </div>

      {/* แจ้งเตือนการบันทึกสำเร็จ */}
      {showSuccess && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md relative">
          <span>บันทึกการตั้งค่าเรียบร้อยแล้ว</span>
          <button
            onClick={() => setShowSuccess(false)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* แท็บการตั้งค่า */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 flex items-center space-x-2 border-b-2 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* เนื้อหาแท็บ */}
        <div className="p-6">
          {/* การตั้งค่าทั่วไป */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                การตั้งค่าทั่วไป
              </h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="appName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    ชื่อแอปพลิเคชัน
                  </label>
                  <input
                    type="text"
                    id="appName"
                    value={generalSettings.appName}
                    onChange={(e) =>
                      handleGeneralSettingChange("appName", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="supportEmail"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    อีเมลสนับสนุน
                  </label>
                  <input
                    type="email"
                    id="supportEmail"
                    value={generalSettings.supportEmail}
                    onChange={(e) =>
                      handleGeneralSettingChange("supportEmail", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showPrototypeNotice"
                    checked={generalSettings.showPrototypeNotice}
                    onChange={(e) =>
                      handleGeneralSettingChange(
                        "showPrototypeNotice",
                        e.target.checked
                      )
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="showPrototypeNotice"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    แสดงแจ้งเตือนเวอร์ชันต้นแบบ
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ตัวเลือกภาษา
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="langEn"
                      checked={generalSettings.languageOptions.includes("en")}
                      onChange={(e) => {
                        const newLangs = e.target.checked
                          ? [...generalSettings.languageOptions, "en"]
                          : generalSettings.languageOptions.filter(
                              (lang) => lang !== "en"
                            );
                        handleGeneralSettingChange("languageOptions", newLangs);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="langEn"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      ภาษาอังกฤษ (English)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="langTh"
                      checked={generalSettings.languageOptions.includes("th")}
                      onChange={(e) => {
                        const newLangs = e.target.checked
                          ? [...generalSettings.languageOptions, "th"]
                          : generalSettings.languageOptions.filter(
                              (lang) => lang !== "th"
                            );
                        handleGeneralSettingChange("languageOptions", newLangs);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="langTh"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      ภาษาไทย (Thai)
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ภาษาเริ่มต้น
                </label>
                <select
                  value={generalSettings.defaultLanguage}
                  onChange={(e) =>
                    handleGeneralSettingChange(
                      "defaultLanguage",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {generalSettings.languageOptions.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang === "en" ? "English (อังกฤษ)" : "Thai (ไทย)"}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* การตั้งค่าการแจ้งเตือน */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                การตั้งค่าการแจ้งเตือน
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableEmailNotifications"
                      checked={notificationSettings.enableEmailNotifications}
                      onChange={(e) =>
                        handleNotificationSettingChange(
                          "enableEmailNotifications",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="enableEmailNotifications"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      เปิดใช้งานการแจ้งเตือนทางอีเมล
                    </label>
                  </div>
                  <Mail size={20} className="text-gray-400" />
                </div>

                <div className="pl-6 space-y-2 border-l border-gray-200 ml-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="notifyOnNewUser"
                      checked={notificationSettings.notifyOnNewUser}
                      onChange={(e) =>
                        handleNotificationSettingChange(
                          "notifyOnNewUser",
                          e.target.checked
                        )
                      }
                      disabled={!notificationSettings.enableEmailNotifications}
                      className={`h-4 w-4 focus:ring-blue-500 border-gray-300 rounded ${
                        notificationSettings.enableEmailNotifications
                          ? "text-blue-600"
                          : "text-gray-300"
                      }`}
                    />
                    <label
                      htmlFor="notifyOnNewUser"
                      className={`ml-2 block text-sm ${
                        notificationSettings.enableEmailNotifications
                          ? "text-gray-700"
                          : "text-gray-400"
                      }`}
                    >
                      แจ้งเตือนเมื่อมีผู้ใช้ใหม่
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="notifyOnNewObstacle"
                      checked={notificationSettings.notifyOnNewObstacle}
                      onChange={(e) =>
                        handleNotificationSettingChange(
                          "notifyOnNewObstacle",
                          e.target.checked
                        )
                      }
                      disabled={!notificationSettings.enableEmailNotifications}
                      className={`h-4 w-4 focus:ring-blue-500 border-gray-300 rounded ${
                        notificationSettings.enableEmailNotifications
                          ? "text-blue-600"
                          : "text-gray-300"
                      }`}
                    />
                    <label
                      htmlFor="notifyOnNewObstacle"
                      className={`ml-2 block text-sm ${
                        notificationSettings.enableEmailNotifications
                          ? "text-gray-700"
                          : "text-gray-400"
                      }`}
                    >
                      แจ้งเตือนเมื่อมีการรายงานอุปสรรคใหม่
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="notifyOnNewLocation"
                      checked={notificationSettings.notifyOnNewLocation}
                      onChange={(e) =>
                        handleNotificationSettingChange(
                          "notifyOnNewLocation",
                          e.target.checked
                        )
                      }
                      disabled={!notificationSettings.enableEmailNotifications}
                      className={`h-4 w-4 focus:ring-blue-500 border-gray-300 rounded ${
                        notificationSettings.enableEmailNotifications
                          ? "text-blue-600"
                          : "text-gray-300"
                      }`}
                    />
                    <label
                      htmlFor="notifyOnNewLocation"
                      className={`ml-2 block text-sm ${
                        notificationSettings.enableEmailNotifications
                          ? "text-gray-700"
                          : "text-gray-400"
                      }`}
                    >
                      แจ้งเตือนเมื่อมีการเพิ่มสถานที่ใหม่
                    </label>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="batchNotifications"
                    checked={notificationSettings.batchNotifications}
                    onChange={(e) =>
                      handleNotificationSettingChange(
                        "batchNotifications",
                        e.target.checked
                      )
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="batchNotifications"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    รวมการแจ้งเตือนเป็นชุด (แทนที่จะส่งแยก)
                  </label>
                </div>

                <div className="space-y-4 border-t border-gray-200 pt-4 mt-4">
                  <h3 className="text-md font-medium text-gray-900">
                    รายงานสรุป
                  </h3>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="dailySummary"
                      checked={notificationSettings.dailySummary}
                      onChange={(e) =>
                        handleNotificationSettingChange(
                          "dailySummary",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="dailySummary"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      ส่งรายงานสรุปประจำวัน
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="weeklyReport"
                      checked={notificationSettings.weeklyReport}
                      onChange={(e) =>
                        handleNotificationSettingChange(
                          "weeklyReport",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="weeklyReport"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      ส่งรายงานสรุปประจำสัปดาห์
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* การตั้งค่าความปลอดภัย */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                การตั้งค่าความปลอดภัย
              </h2>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requireStrongPasswords"
                    checked={securitySettings.requireStrongPasswords}
                    onChange={(e) =>
                      handleSecuritySettingChange(
                        "requireStrongPasswords",
                        e.target.checked
                      )
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="requireStrongPasswords"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    ต้องใช้รหัสผ่านที่รัดกุม (อักษรตัวเล็ก/ใหญ่, ตัวเลข,
                    สัญลักษณ์)
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="passwordExpiryDays"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    จำนวนวันที่รหัสผ่านหมดอายุ
                  </label>
                  <input
                    type="number"
                    id="passwordExpiryDays"
                    value={securitySettings.passwordExpiryDays}
                    onChange={(e) =>
                      handleSecuritySettingChange(
                        "passwordExpiryDays",
                        parseInt(e.target.value)
                      )
                    }
                    min="0"
                    max="365"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    0 = ไม่มีวันหมดอายุ
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="maxLoginAttempts"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    จำนวนครั้งสูงสุดที่เข้าสู่ระบบไม่สำเร็จ
                  </label>
                  <input
                    type="number"
                    id="maxLoginAttempts"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) =>
                      handleSecuritySettingChange(
                        "maxLoginAttempts",
                        parseInt(e.target.value)
                      )
                    }
                    min="1"
                    max="10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="sessionTimeoutMinutes"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    เวลาหมดอายุของเซสชั่น (นาที)
                  </label>
                  <input
                    type="number"
                    id="sessionTimeoutMinutes"
                    value={securitySettings.sessionTimeoutMinutes}
                    onChange={(e) =>
                      handleSecuritySettingChange(
                        "sessionTimeoutMinutes",
                        parseInt(e.target.value)
                      )
                    }
                    min="5"
                    max="1440"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-4 border-t border-gray-200 pt-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="twoFactorAuth"
                    checked={securitySettings.twoFactorAuth}
                    onChange={(e) =>
                      handleSecuritySettingChange(
                        "twoFactorAuth",
                        e.target.checked
                      )
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="twoFactorAuth"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    เปิดใช้งานการยืนยันตัวตนสองชั้น (2FA) สำหรับผู้ดูแลระบบ
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="adminApprovalForNewModerators"
                    checked={securitySettings.adminApprovalForNewModerators}
                    onChange={(e) =>
                      handleSecuritySettingChange(
                        "adminApprovalForNewModerators",
                        e.target.checked
                      )
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="adminApprovalForNewModerators"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    ต้องการการอนุมัติจากผู้ดูแลระบบสำหรับผู้ดูแลใหม่
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* การตั้งค่าสำรองข้อมูล */}
          {activeTab === "backup" && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                การตั้งค่าสำรองข้อมูล
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autoBackup"
                      checked={backupSettings.autoBackup}
                      onChange={(e) =>
                        handleBackupSettingChange(
                          "autoBackup",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="autoBackup"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      สำรองข้อมูลอัตโนมัติ
                    </label>
                  </div>
                  <Database size={20} className="text-gray-400" />
                </div>

                <div className="pl-6 space-y-4 border-l border-gray-200 ml-2">
                  <div>
                    <label
                      htmlFor="backupFrequency"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      ความถี่ในการสำรองข้อมูล
                    </label>
                    <select
                      id="backupFrequency"
                      value={backupSettings.backupFrequency}
                      onChange={(e) =>
                        handleBackupSettingChange(
                          "backupFrequency",
                          e.target.value
                        )
                      }
                      disabled={!backupSettings.autoBackup}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        !backupSettings.autoBackup ? "bg-gray-100" : ""
                      }`}
                    >
                      <option value="hourly">ทุกชั่วโมง</option>
                      <option value="daily">ทุกวัน</option>
                      <option value="weekly">ทุกสัปดาห์</option>
                      <option value="monthly">ทุกเดือน</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="keepBackupDays"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      จำนวนวันที่เก็บข้อมูลสำรอง
                    </label>
                    <input
                      type="number"
                      id="keepBackupDays"
                      value={backupSettings.keepBackupDays}
                      onChange={(e) =>
                        handleBackupSettingChange(
                          "keepBackupDays",
                          parseInt(e.target.value)
                        )
                      }
                      min="1"
                      max="365"
                      disabled={!backupSettings.autoBackup}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        !backupSettings.autoBackup ? "bg-gray-100" : ""
                      }`}
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="includeImages"
                      checked={backupSettings.includeImages}
                      onChange={(e) =>
                        handleBackupSettingChange(
                          "includeImages",
                          e.target.checked
                        )
                      }
                      disabled={!backupSettings.autoBackup}
                      className={`h-4 w-4 border-gray-300 rounded focus:ring-blue-500 ${
                        backupSettings.autoBackup
                          ? "text-blue-600"
                          : "text-gray-300"
                      }`}
                    />
                    <label
                      htmlFor="includeImages"
                      className={`ml-2 block text-sm ${
                        backupSettings.autoBackup
                          ? "text-gray-700"
                          : "text-gray-400"
                      }`}
                    >
                      รวมไฟล์รูปภาพในการสำรองข้อมูล
                    </label>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="backupLocation"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    ตำแหน่งจัดเก็บข้อมูลสำรอง
                  </label>
                  <select
                    id="backupLocation"
                    value={backupSettings.backupLocation}
                    onChange={(e) =>
                      handleBackupSettingChange(
                        "backupLocation",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="local">เซิร์ฟเวอร์ท้องถิ่น</option>
                    <option value="cloud">คลาวด์สตอเรจ</option>
                    <option value="both">ทั้งสองตำแหน่ง</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <CloudUpload size={16} />
                    <span>สำรองข้อมูลทันที</span>
                  </button>

                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    <RefreshCw size={16} />
                    <span>เรียกคืนข้อมูลจากไฟล์สำรอง</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* การตั้งค่าระบบ */}
          {activeTab === "system" && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                การดำเนินการกับระบบ
              </h2>

              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                  <h3 className="text-md font-medium text-blue-800 mb-2 flex items-center gap-2">
                    <ShieldAlert size={20} />
                    คำเตือน
                  </h3>
                  <p className="text-sm text-blue-700">
                    การดำเนินการเหล่านี้มีผลกระทบต่อการทำงานของระบบ
                    โปรดดำเนินการด้วยความระมัดระวัง
                  </p>
                </div>

                <div className="border rounded-md overflow-hidden">
                  <div className="border-b">
                    <div className="flex justify-between items-center p-4">
                      <div>
                        <h3 className="font-medium text-gray-900">ล้างแคช</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          ล้างหน่วยความจำชั่วคราวเพื่อเพิ่มประสิทธิภาพของระบบ
                        </p>
                      </div>
                      <button
                        onClick={() => openConfirmation("clearCache")}
                        className="px-4 py-2 text-sm bg-gray-100 text-gray-900 rounded-md hover:bg-gray-200"
                      >
                        ล้างแคช
                      </button>
                    </div>
                  </div>

                  <div className="border-b">
                    <div className="flex justify-between items-center p-4">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          รีเฟรชข้อมูล
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          อัพเดทข้อมูลจากฐานข้อมูลและรีเฟรชหน่วยความจำแคช
                        </p>
                      </div>
                      <button
                        onClick={() => openConfirmation("refreshData")}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        รีเฟรชข้อมูล
                      </button>
                    </div>
                  </div>

                  <div className="border-b">
                    <div className="flex justify-between items-center p-4">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          ล้างข้อมูลรายงานเก่า
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          ลบข้อมูลรายงานและสถิติที่เก่ากว่า 1 ปี
                        </p>
                      </div>
                      <button
                        onClick={() => openConfirmation("clearReports")}
                        className="px-4 py-2 text-sm bg-gray-100 text-gray-900 rounded-md hover:bg-gray-200"
                      >
                        ล้างข้อมูล
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center p-4">
                      <div>
                        <h3 className="font-medium text-red-600">รีเซ็ตระบบ</h3>
                        <p className="text-sm text-red-500 mt-1">
                          รีเซ็ตระบบกลับสู่ค่าเริ่มต้น
                          จะลบข้อมูลทั้งหมดยกเว้นบัญชีผู้ดูแลระบบ
                        </p>
                      </div>
                      <button
                        onClick={() => openConfirmation("resetSystem")}
                        className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        รีเซ็ตระบบ
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-md font-medium text-gray-900 mb-2">
                    ข้อมูลระบบ
                  </h3>
                  <div className="bg-gray-50 rounded-md p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">
                        เวอร์ชันแอปพลิเคชัน:
                      </span>
                      <span className="text-sm font-medium">
                        1.0.0 (Build 2024.07.31)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">
                        สถานะฐานข้อมูล:
                      </span>
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-sm font-medium">ออนไลน์</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">
                        อัพเดทล่าสุด:
                      </span>
                      <span className="text-sm font-medium">
                        31 กรกฎาคม 2024, 10:15:30
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">
                        สำรองข้อมูลล่าสุด:
                      </span>
                      <span className="text-sm font-medium">
                        31 กรกฎาคม 2024, 00:00:00
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal ยืนยันการดำเนินการ */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              ยืนยันการดำเนินการ
            </h3>

            <p className="text-gray-600 mb-6">
              {confirmAction === "clearCache" &&
                "คุณต้องการล้างแคชของระบบใช่หรือไม่? การดำเนินการนี้อาจทำให้ระบบทำงานช้าลงชั่วคราว"}
              {confirmAction === "refreshData" &&
                "คุณต้องการรีเฟรชข้อมูลทั้งหมดใช่หรือไม่? ระบบจะอัพเดทข้อมูลล่าสุดจากฐานข้อมูล"}
              {confirmAction === "clearReports" &&
                "คุณต้องการลบข้อมูลรายงานเก่ากว่า 1 ปีใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้"}
              {confirmAction === "resetSystem" &&
                "คุณแน่ใจหรือไม่ที่จะรีเซ็ตระบบกลับสู่ค่าเริ่มต้น? ข้อมูลทั้งหมดจะถูกลบยกเว้นบัญชีผู้ดูแลระบบ"}
            </p>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSystemAction}
                className={`px-4 py-2 rounded-md text-white ${
                  confirmAction === "resetSystem"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
