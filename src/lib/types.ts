export type UserRole = "student" | "faculty" | "admin" | "rescue";
export type AlertSeverity = "safe" | "warning" | "emergency" | "critical";
export type AlertStatus = "open" | "acknowledged" | "responding" | "on_site" | "resolved";
export type NodeStatus = "online" | "offline";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  building: string | null;
  department: string | null;
};

export type Building = {
  id: string;
  name: string;
  status: string;
};

export type SensorNode = {
  id: string;
  code: string;
  location: string;
  building_id: string | null;
  status: NodeStatus;
  temperature_c: number;
  humidity_pct: number;
  smoke_level: string;
  flame_detected: boolean;
  ir_detected: boolean;
  load_pct: number | null;
  updated_at?: string | null;
};

export type Alert = {
  id: string;
  title: string;
  location: string;
  building_id: string | null;
  node_id: string | null;
  severity: AlertSeverity;
  status: AlertStatus;
  created_at: string;
};

export function dashboardPath(role: UserRole) {
  if (role === "admin") return "/admin";
  if (role === "faculty") return "/faculty";
  if (role === "rescue") return "/rescue";
  return "/student";
}
