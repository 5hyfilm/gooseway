"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Users,
  MapPin,
  AlertTriangle,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ChevronDown,
  RouteIcon,
} from "lucide-react";
import { getDashboardData } from "@/services/api/endpoints/dashboard";
import {
  ActivityType,
  Activity,
  DashboardStats,
  DashboardChart,
  accessLevelMap,
  obstacleIconMap,
} from "@/lib/types/dashboard";
import {
  getActivityActionLabel,
  renderActivityMetaData,
} from "@/data/dashboard";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    user: {
      totalUsers: 0,
      thisMonth: 0,
      lastMonth: 0,
      growthPercent: 0,
    },
    location: {
      totalLocation: 0,
      thisMonth: 0,
      lastMonth: 0,
      growthPercent: 0,
    },
    obstacle: {
      totalObstacle: 0,
      thisMonth: 0,
      lastMonth: 0,
      growthPercent: 0,
    },
    review: {
      totalReview: 0,
      thisMonth: 0,
      lastMonth: 0,
      growthPercent: 0,
    },
  });
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])
  const [locationStats, setLocationStats] = useState<DashboardChart[]>([]);
  const [locationLevelStats, setLocationLevelStats] = useState<DashboardChart[]>([]);
  const [obstacleStats, setObstacleStats] = useState<DashboardChart[]>([]);

  const [loading, setLoading] = useState(true);
  const [dayFilter, setDayFilter] = useState("All");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getDashboardData(dayFilter);
        setStats({
          user: data.user,
          location: data.location,
          obstacle: data.obstacle,
          review: data.review,
        });
        setRecentActivities(data.log);
        setLocationStats(data.locationCategory);
        setObstacleStats(data.obstacleCategory);
        setLocationLevelStats(data.locationCategoryAccessLevel);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dayFilter]);

  // Chart data
  const locationPieData = {
    series: locationStats.map((cat) => Number(cat.percent)),
    options: {
      chart: { 
        toolbar: { show: false } 
      },
      labels: locationStats.map((cat) => cat.categoryName || `หมวดหมู่ ${cat.categoryId}`),
      colors: ["#633ebb", "#bc6cca", "#f1b35f", "#f13c59"],
      dataLabels: { enabled: true },
    },
  };

  const locationCategories = Array.from(
    new Set(locationLevelStats.map((cat) => cat.categoryId))
  );

  const locationStackedBarData = {
    series: [1, 2, 3].map((accessLevelId) => ({
      name: accessLevelMap[accessLevelId],
      data: locationCategories.map((categoryId) => {
        const found = locationLevelStats.find(
          (stat) =>
            stat.categoryId === categoryId &&
            stat.accessLevelId === accessLevelId
        );
        return found ? Number(found.count) : 0;
      }),
    })),
    options: {
      chart: { 
        stacked: true, 
        toolbar: { show: false } 
      },
      plotOptions: { 
        bar: { 
          horizontal: true, 
          borderRadius: 5,
          barHeight: "50%",
        } 
      },
      xaxis: {
        categories: locationCategories.map(
          (categoryId) =>
            locationLevelStats.find((cat) => cat.categoryId === categoryId)?.categoryName || `หมวดหมู่ ${categoryId}`
        ),
        labels: { 
          style: { 
            fontSize: "13px"
          } 
        },
      },
      colors: ["#22c55e", "#eab308", "#ef4444"],
      dataLabels: { enabled: true },
      fill: { opacity: 1 },
    },
  };

  const obstacleBarData = {
    series: [
      {
        name: "เปอร์เซ็นต์",
        data: obstacleStats.map((cat) => Number(cat.percent)),
      },
    ],
    options: {
      chart: { 
        toolbar: { show: false }, 
        stacked: false
      },
      plotOptions: { 
        bar: { 
          horizontal: false, 
          borderRadius: 5,
          columnWidth: "25%",
        } 
      },
      xaxis: { 
        categories: obstacleStats.map((cat) => {
          const icon = obstacleIconMap[cat.categoryId] || "❓";
          const categoryName = cat.categoryName || `หมวดหมู่ ${cat.categoryId}`;
          return `${icon} ${categoryName}`;
        }),
        labels: { 
          style: { fontSize: "13px" },
          rotate: 0,
          hideOverlappingLabels: false,
          trim: true,
        },
      },
      colors: ["#6366f1"],
      dataLabels: { enabled: true },
    },
  };

  const timeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // seconds

    if (diff < 60) return "ไม่กี่วินาทีที่แล้ว";
    if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} วันที่แล้ว`;

    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-gray-800">แดชบอร์ด</h1>
      <div className="relative">
        <select
          value={dayFilter}
          onChange={(e) => setDayFilter(e.target.value)}
          className="pl-4 pr-8 py-2 border rounded-md bg-blue-600 focus:ring-2 focus:ring-blue-500 appearance-none"
        >
          <option value="All" className="text-center">ทุกช่วงเวลา</option>
          <option value="7">7 วันที่แล้ว</option>
          <option value="14">14 วันที่แล้ว</option>
          <option value="30">30 วันที่แล้ว</option>
        </select>
        <ChevronDown
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white"
          size={16}
        />
      </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="จำนวนผู้ใช้งาน"
          value={stats.user?.totalUsers}
          icon={<Users className="text-blue-500" size={24} />}
          change={Math.abs(stats.user?.growthPercent || 0)}
          positive={stats.user?.growthPercent > 0}
        />
        <StatsCard
          title="สถานที่ทั้งหมด"
          value={stats.location?.totalLocation}
          icon={<MapPin className="text-green-500" size={24} />}
          change={Math.abs(stats.location?.growthPercent || 0)}
          positive={stats.location?.growthPercent > 0}
        />
        <StatsCard
          title="อุปสรรคที่รายงาน"
          value={stats.obstacle?.totalObstacle}
          icon={<AlertTriangle className="text-orange-500" size={24} />}
          change={Math.abs(stats.obstacle?.growthPercent || 0)}
          positive={stats.obstacle?.growthPercent > 0}
        />
        <StatsCard
          title="รีวิวและความคิดเห็น"
          value={stats.review?.totalReview}
          icon={<MessageSquare className="text-purple-500" size={24} />}
          change={Math.abs(stats.review?.growthPercent || 0)}
          positive={stats.review?.growthPercent > 0}
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">กิจกรรมล่าสุด</h2>
              {recentActivities.length > 0 && (
                <button className="text-blue-600 hover:text-blue-800 flex items-center"
                  onClick={() => router.push("/admin/activities")}
                >
                  ดูทั้งหมด <ArrowRight size={16} className="ml-1" />
                </button>
              )}
            </div>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.slice(0, 5).map((activity, index) => (
                <div
                  key={activity.id || `activity-${index}`}
                  className="flex items-start space-x-3 p-4 border-b last:border-b-0"
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getActivityIconColor(activity.entityType)}`}
                  >
                    {getActivityIcon(activity.entityType)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{getActivityActionLabel(activity.entityType, activity.action)}</h3>
                      <p className="text-xs text-gray-500">
                        {timeAgo(activity.createdAt)}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600">
                      {activity.userName} - {renderActivityMetaData(activity)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <MessageSquare className="text-gray-300 mb-4" size={48} />
                <p className="text-gray-500 text-lg font-medium mb-2">ไม่มีกิจกรรมล่าสุด</p>
                <p className="text-gray-400 text-sm">กิจกรรมจะแสดงที่นี่เมื่อมีการใช้งานระบบ</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          {/* Location Distribution */}
            <h3 className="text-md font-medium mb-2">สถิติสถานที่</h3>
            {locationPieData.series.length > 0 ? (
              <ReactApexChart
                options={locationPieData.options}
                series={locationPieData.series}
                type="pie"
                height={350}
              />
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500 text-center">ไม่มีข้อมูลสถานที่</p>
              </div>
            )}
        </div>

        {/* Accessibility Levels */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-md font-medium mb-2">ระดับการเข้าถึงของสถานที่</h3>
          {locationStackedBarData.series[0].data.length > 0 ? (
            <ReactApexChart
              options={locationStackedBarData.options}
              series={locationStackedBarData.series}
              type="bar"
              height={250}
            />
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500 text-center">ไม่มีข้อมูลระดับการเข้าถึง</p>
            </div>
          )}
        </div>

        {/* Frequent Obstacles */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-md font-medium mb-2">อุปสรรคที่รายงานบ่อย</h3>
          {obstacleBarData.series[0].data.length > 0 ? (
            <ReactApexChart
              options={obstacleBarData.options}
              series={obstacleBarData.series}
              type="bar"
              height={250}
            />
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500 text-center">ไม่มีข้อมูลอุปสรรค</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// กำหนดประเภทข้อมูลสำหรับ Props ของ StatsCard
interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  change: number;
  positive: boolean;
}

// Stats Card Component
function StatsCard({ title, value, icon, change, positive }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between">
        <span className="text-gray-500">{title}</span>
        {icon}
      </div>
      <p className="text-3xl font-bold mt-4 mb-2">{value?.toLocaleString()}</p>
      <div className="flex items-center">
        <span
          className={`inline-flex items-center ${
            positive ? "text-green-600" : "text-red-600"
          }`}
        >
          {positive ? (
            <ArrowUp size={16} className="mr-1" />
          ) : (
            <ArrowDown size={16} className="mr-1" />
          )}
          {change}%
        </span>
        <span className="ml-2 text-gray-500 text-sm">จากเดือนที่แล้ว</span>
      </div>
    </div>
  );
}

// Helper functions for activity feed
function getActivityIcon(type: ActivityType): React.ReactNode {
  switch (type) {
    case "user":
      return <Users size={18} className="text-white" />;
    case "location":
      return <MapPin size={18} className="text-white" />;
    case "obstacle":
      return <AlertTriangle size={18} className="text-white" />;
    case "post":
      return <MessageSquare size={18} className="text-white" />;
    case "route":
      return <RouteIcon size={18} className="text-white" />;
    default:
      return <ArrowRight size={18} className="text-white" />;
  }
}

function getActivityIconColor(type: ActivityType): string {
  switch (type) {
    case "user":
      return "bg-blue-500";
    case "location":
      return "bg-green-500";
    case "obstacle":
      return "bg-orange-500";
    case "post":
      return "bg-purple-500";
    case "route":
      return "bg-blue-600";
    default:
      return "bg-gray-500";
  }
}
