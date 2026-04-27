"use client";

import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { COLORS } from "@/lib/colors";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export interface SpecializationStat {
  name: string;
  hoverName?: string;
  attendancePercentage: number;
  total: number;
  studyYear: number;
}

interface Props {
  specializations: SpecializationStat[];
}

export function SpecializationBarChart({ specializations }: Props) {
  // Ignore entirely any specializations/years that have absolutely 0 students
  const validSpecs = specializations.filter((s) => s.total > 0);

  const seriesData: any[] = [];
  const barColors: string[] = [];
  const separatorKeys: string[] = [];

  let currentGroupName = "";
  let groupIndex = 0;

  validSpecs.forEach((spec, index) => {
    // Insert a visually empty transparent row acting as a separator at the start of a NEW group
    if (spec.name !== currentGroupName && currentGroupName !== "") {
      const sepName = `---sep-${groupIndex}---`;
      separatorKeys.push(sepName);
      seriesData.push({
        x: sepName,
        y: 0,
        yearLabel: "",
        hoverName: "", // prevent tooltip string
      });
      barColors.push("transparent"); // Invisible bar
      groupIndex++;
    }

    // Extract sub-label (year or general)
    let subLabel = "عام";
    if (spec.hoverName && spec.hoverName.includes("-")) {
      subLabel = spec.hoverName.split("-")[1].trim();
    } else if (spec.hoverName && spec.hoverName.includes("سنة")) {
      const idx = spec.hoverName.indexOf("سنة");
      subLabel = spec.hoverName.substring(idx).trim();
    }

    // Is this the very first bar in its specialization group?
    const isFirstInGroup = spec.name !== currentGroupName;
    currentGroupName = spec.name;

    // Y-axis label trick: Show the name on the first entry, use a unique invisible blank string for others
    // This perfectly satisfies putting ONLY the specialization name on the Y-Axis
    // AND ensures it uses a single continuous logical series to prevent ANY rendering gaps!
    const xLabel = isFirstInGroup ? spec.name : " ".repeat(index + 1);

    seriesData.push({
      x: xLabel,
      y: spec.attendancePercentage,
      yearLabel: subLabel,
      hoverName: spec.hoverName || spec.name,
    });

    // Assign semantic color based on the year
    if (subLabel.includes("أولى")) barColors.push(COLORS.year1);
    else if (subLabel.includes("ثانية")) barColors.push(COLORS.year2);
    else if (subLabel.includes("ثالثة")) barColors.push(COLORS.year3);
    else if (subLabel.includes("رابعة")) barColors.push(COLORS.year4);
    else if (subLabel.includes("خامسة")) barColors.push(COLORS.year5);
    else if (subLabel.includes("سادسة")) barColors.push(COLORS.year6);
    else barColors.push(COLORS.yearDefault);
  });

  const series = [
    {
      name: "نسبة الحضور",
      data: seriesData,
    },
  ];

  // Create the precise separating lines mapping manually to the dummy spacers
  const separatorAnnotations = separatorKeys.map((c) => ({
    y: c,
    borderColor: COLORS.chartSeparator,
    strokeDashArray: 4, // clean dotted appearance
    borderWidth: 2,
    offsetX: 0,
  }));

  const options: ApexOptions = {
    chart: {
      type: "bar",
      fontFamily: "inherit",
      toolbar: { show: false },
      animations: {
        enabled: true,
        speed: 600,
        animateGradually: { enabled: true, delay: 80 },
      },
      stacked: false,
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "80%", // Reduced thickness for lighter visual weight
        borderRadius: 4,
        borderRadiusApplication: "end",
        dataLabels: { position: "center" }, // Forces text inside the bars perfectly
        distributed: true, // Lets each physical bar have its own distinct logical color securely
      },
    },
    dataLabels: {
      enabled: true,
      textAnchor: "middle",
      style: {
        colors: [COLORS.chartLabelWhite],
        fontSize: "12px",
        fontFamily: "inherit",
        fontWeight: 600,
      },
      formatter: function (val: any, opt: any) {
        if (!val) return "";
        const dataPoint =
          opt.w.config.series[opt.seriesIndex].data[opt.dataPointIndex];
        // Inject the study year perfectly inside the colored horizontal bar!
        if (dataPoint.yearLabel === "عام") return `%${val}`;
        return `${dataPoint.yearLabel} - % ${val}`;
      },
      dropShadow: {
        enabled: true,
        top: 1,
        left: 1,
        blur: 1,
        color: COLORS.chartDropShadow,
        opacity: 0.3,
      },
    },
    colors: barColors,
    annotations: {
      yaxis: separatorAnnotations, // Perfectly draws separator line on group jump
    },
    xaxis: {
      max: 100,
      labels: {
        style: { fontFamily: "inherit", colors: COLORS.chartText },
        formatter: (val: string) => `${val}%`, // Percents purely on X-axis globally
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        minWidth: 90, // Forces the bounding box to reserve adequate width for the text
        maxWidth: 250,
        style: {
          fontFamily: "inherit",
          fontWeight: 700,
          colors: COLORS.chartTextDark,
          fontSize: "13px",
        },
        formatter: (val: any) => {
          // Hide completely the dummy markers from user visuals
          if (typeof val === "string" && val.startsWith("---sep-")) return "";
          return val;
        },
      },
    },
    grid: {
      borderColor: COLORS.chartGrid,
      strokeDashArray: 4,
      xaxis: { lines: { show: true } }, // Clean percentage lines
      yaxis: { lines: { show: false } }, // Ensure no false positive group lines natively
      padding: {
        top: 0,
        right: 15,
        bottom: 0,
        left: 0,
      },
    },
    legend: {
      show: false,
    },
    tooltip: {
      shared: false,
      intersect: true,
      custom: function ({ seriesIndex, dataPointIndex, w }) {
        const dataPoint = w.config.series[seriesIndex].data[dataPointIndex];

        // Hide tooltip perfectly if the user happens to hover precisely on the dummy separator spacer
        if (!dataPoint.yearLabel) return "";

        const barActiveColor = barColors[dataPointIndex];

        return `
          <div class="p-3 bg-white border border-gray-100 shadow-xl rounded-xl flex flex-col gap-2 min-w-[180px]" dir="rtl">
            <div class="font-bold text-gray-800 text-[13px] border-b border-gray-100 pb-2 mb-1">
              ${dataPoint.hoverName}
            </div>
            <div class="flex justify-between items-center text-[13px] gap-6 mt-2">
              <span class="text-gray-500 font-medium">نسبة الحضور</span>
              <span class="font-bold border px-2 py-0.5 rounded-md" style="color: ${barActiveColor}; border-color: ${barActiveColor}33; background: ${barActiveColor}11">${dataPoint.y}%</span>
            </div>
          </div>
        `;
      },
    },
    fill: {
      opacity: 1,
    },
    states: {
      hover: { filter: { type: "lighten" } },
    },
  };

  // Adjust container pixel dynamic Height strictly based on rendered sequences
  const dynamicHeight = Math.max(
    300,
    validSpecs.length * 40 + separatorKeys.length * 30,
  );

  return (
    <div className="w-full text-left" dir="ltr">
      <style>{`
        .apexcharts-tooltip {
          direction: rtl !important;
          text-align: right !important;
          font-family: inherit !important;
        }
        .apexcharts-tooltip-marker {
          margin-right: 0 !important;
          margin-left: 6px !important;
        }
        .apexcharts-tooltip-text-y-label {
          display: inline-block !important;
          margin-left: 4px !important;
          margin-right: 0 !important;
        }
      `}</style>
      <ReactApexChart
        type="bar"
        series={series}
        options={options}
        height={dynamicHeight}
        width="100%"
      />
    </div>
  );
}
