export const roleMap: Record<string, string> = {
  admin: "مدير النظام",
  teacher: "معلم",
  "department-head": "رئيس القسم",
  student: "طالب",
};

export const roleToRoute: Record<string, string> = {
  admin: "/admin",
  teacher: "/teacher",
  "department-head": "/department-head",
  student: "/student",
};

export type UserRole = "admin" | "teacher" | "department-head" | "student";
export const ROLE_OPTIONS = [
  // { id: 1, label: "مدير النظام" },
  { id: 2, label: "معلم" },
  { id: 3, label: "رئيس قسم" },
  { id: 4, label: "طالب" },
];
