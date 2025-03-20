
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, 
  PlusCircle, 
  Edit, 
  PlayCircle, 
  Trophy, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState } from "react";

export const AdminSidebar = () => {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Create Test",
      path: "/create-test",
      icon: <PlusCircle className="h-5 w-5" />,
    },
    {
      name: "Update Questions",
      path: "/update-questions",
      icon: <Edit className="h-5 w-5" />,
    },
    {
      name: "Start/Stop Test",
      path: "/manage-test",
      icon: <PlayCircle className="h-5 w-5" />,
    },
    {
      name: "Leaderboard",
      path: "/leaderboard",
      icon: <Trophy className="h-5 w-5" />,
    },
  ];

  return (
    <motion.div 
      className={cn(
        "h-screen fixed left-0 top-0 z-40 flex flex-col bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-64"
      )}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4 flex justify-between items-center border-b">
        <div className={cn("flex items-center", collapsed && "justify-center w-full")}>
          {!collapsed && (
            <motion.span 
              className="font-semibold ml-2 text-gray-800" 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Exam Admin
            </motion.span>
          )}
        </div>
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md hover:bg-gray-100 text-gray-500"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <div className="flex-1 py-6 overflow-y-auto">
        <ul className="space-y-2 px-3">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link 
                to={item.path} 
                className={cn(
                  "flex items-center p-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200",
                  pathname === item.path && "bg-gray-100 text-gray-900",
                  collapsed && "justify-center"
                )}
              >
                <div className={cn("flex items-center", collapsed && "justify-center")}>
                  {item.icon}
                  {!collapsed && <span className="ml-3">{item.name}</span>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 border-t">
        <button 
          onClick={logout}
          className={cn(
            "flex items-center p-3 w-full text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </motion.div>
  );
};
