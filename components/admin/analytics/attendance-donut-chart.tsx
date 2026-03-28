"use client";

import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface AttendanceDonutChartProps {
  attendancePercentage: number;
}

export function AttendanceDonutChart({
  attendancePercentage,
}: AttendanceDonutChartProps) {
  const options: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "inherit",
      animations: {
        enabled: true,
        speed: 700,
        animateGradually: { enabled: true, delay: 100 },
        dynamicAnimation: { enabled: true, speed: 350 },
      },
    },
    labels: ["الحضور", "الغياب"],
    colors: ["#22c55e", "#f43f5e"],
    dataLabels: {
      enabled: false,

      dropShadow: { enabled: false },
    },
    stroke: {
      width: 4,
      colors: ["#ffffff"],
    },
    plotOptions: {
      pie: {
        donut: {
          size: "72%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "30px",
              fontWeight: 600,
              color: "#6b7280",
              offsetY: 20,
              formatter: () => "نسبة الحضور",
            },
            value: {
              show: true,
              fontSize: "38px",
              fontWeight: 800,
              color: "#111827",
              offsetY: -20,
              formatter: () => `${attendancePercentage}%`,
            },
            total: {
              show: true,
              label: "نسبة الحضور",
              color: "#6b7280",
              fontSize: "14px",
              fontWeight: 600,
              formatter: () => `${attendancePercentage}%`,
            },
          },
        },
      },
    },
    legend: {
      show: true,
      position: "bottom",
      fontFamily: "inherit",
      fontSize: "14px",
      fontWeight: 600,
      offsetY: 8,
      markers: {
        size: 10,
      },
      itemMargin: { horizontal: 20, vertical: 8 },
    },
    tooltip: {
      style: { fontFamily: "inherit", fontSize: "13px" },
      y: {
        formatter: (val: number) => `${val.toLocaleString()}%`,
      },
    },
    states: {
      hover: { filter: { type: "lighten" } },
      active: { filter: { type: "darken" } },
    },
  };

  return (
    <ReactApexChart
      type="donut"
      series={[attendancePercentage, 100 - attendancePercentage]}
      options={options}
      height={380}
    />
  );
}
