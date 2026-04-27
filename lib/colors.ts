/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║  Centralized Color Constants                            ║
 * ║  Single source of truth for all JS/TS inline colors.    ║
 * ║  Mirrors the CSS variables in globals.css               ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * Usage: import { COLORS } from "@/lib/colors";
 *        colors: [COLORS.success, COLORS.danger]
 */

export const COLORS = {
  /* ── Status ── */
  success: "#22c55e",
  successLight: "#f0fdf4",
  successForeground: "#059669",
  danger: "#dc2626",
  dangerLight: "#fef2f2",
  dangerForeground: "#b91c1c",
  dangerDot: "#ef4444",
  warning: "#f59e0b",
  warningLight: "#fffbeb",
  warningForeground: "#d97706",
  info: "#3b82f6",
  infoLight: "#eff6ff",
  infoForeground: "#1d4ed8",

  /* ── Donut chart (attendance vs absence) ── */
  donutAttendance: "#22c55e",
  donutAbsence: "#f43f5e",

  /* ── Study Year colors for bar chart ── */
  year1: "#3b82f6",
  year2: "#10b981",
  year3: "#f59e0b",
  year4: "#8b5cf6",
  year5: "#ec4899",
  year6: "#14b8a6",
  yearDefault: "#6366f1",

  /* ── Chart utility ── */
  chartText: "#6b7280",
  chartTextDark: "#374151",
  chartTextHeading: "#111827",
  chartSeparator: "#cbd5e1",
  chartGrid: "#f1f5f9",
  chartLabelWhite: "#ffffff",
  chartDropShadow: "#000000",

  /* ── Table utility ── */
  tableRowAlt: "#f9fafb",
  tableRowWhite: "#ffffff",
  tableExpandedBg: "#f0f4ff",

  /* ── Neutral fallbacks ── */
  neutralText: "#4b5563",
  neutralBg: "#f3f4f6",
  neutralDot: "#9ca3af",
} as const;
