import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FilePlus,
  ClipboardList,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/patients", icon: Users, label: "Pacientes" },
  { to: "/new-report", icon: FilePlus, label: "Nuevo Informe" },
  { to: "/history", icon: ClipboardList, label: "Historial" },
  { to: "/settings", icon: Settings, label: "Configuración" },
];

export function Sidebar() {
  return (
    <aside className="flex h-screen w-56 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-14 items-center justify-center border-b border-gray-200">
        <h1 className="text-lg font-bold text-blue-600">OtoReport</h1>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
