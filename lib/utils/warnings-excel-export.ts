import * as XLSX from "xlsx";

interface AbsenceCount {
  absent: number;
  excusedAbsence: number;
  late: number;
}

interface Alert {
  type: number;
  status: number;
  createdAt: string;
}

interface StudentAlert {
  subjectName: string;
  absenceCounts: AbsenceCount;
  alerts: Alert[];
}

interface Student {
  studentName: string;
  studyYear: number;
  specializationName: string;
  studentAlerts: StudentAlert[];
}

interface ExportParams {
  students: Student[];
  alertType: string | number; // "all" | "1" | "2" | "3" | 1 | 2 | 3
  academicYearName: string | number;
  semesterName: string | number;
  fileName: string;
}

/**
 * Export warnings data to Excel with dynamic columns based on alert type filter
 */
export function exportWarningsToExcel({
  students,
  alertType,
  academicYearName,
  semesterName,
  fileName,
}: ExportParams): void {
  // Group students by specialization
  const groupedBySpec = students.reduce(
    (acc, student) => {
      const spec = student.specializationName || "بدون تخصص";
      if (!acc[spec]) acc[spec] = [];
      acc[spec].push(student);
      return acc;
    },
    {} as Record<string, Student[]>,
  );

  const newWb = XLSX.utils.book_new();

  for (const [specName, specStudents] of Object.entries(groupedBySpec)) {
    const rows: any[][] = [];

    // Header rows
    rows.push([
      `السنة الأكاديمية: ${academicYearName}`,
      "",
      `الفصل الدراسي: ${semesterName}`,
    ]);
    rows.push([]);

    // Build dynamic header based on alert type filter
    const baseHeader = [
      "اسم الطالب",
      "السنة",
      "المادة",
      "غياب",
      "غياب بعذر",
      "متأخر",
      "عدد الغيابات الكلي",
    ];

    // Determine which alert columns to include
    const alertTypeStr = String(alertType);
    const includeFirstWarning = alertTypeStr === "all" || alertTypeStr === "1";
    const includeSecondWarning = alertTypeStr === "all" || alertTypeStr === "2";
    const includeDeprivation = alertTypeStr === "all" || alertTypeStr === "3";

    if (includeFirstWarning) {
      baseHeader.push("الإنذار الأول");
    }
    if (includeSecondWarning) {
      baseHeader.push("الإنذار الثاني");
    }

    // Calculate max deprivations only if needed
    let maxDeprivations = 0;
    if (includeDeprivation) {
      specStudents.forEach((s) => {
        s.studentAlerts.forEach((sub) => {
          const depCount = sub.alerts.filter(
            (a) => Number(a.type) === 3,
          ).length;
          if (depCount > maxDeprivations) maxDeprivations = depCount;
        });
      });

      for (let i = 1; i <= maxDeprivations; i++) {
        baseHeader.push(`الحرمان ${i}`);
        baseHeader.push(`حالة الحرمان ${i}`);
      }
    }

    rows.push(baseHeader);

    // Data rows
    specStudents.forEach((s) => {
      s.studentAlerts.forEach((subject) => {
        const firstAlert = subject.alerts.find((a) => Number(a.type) === 1);
        const secondAlert = subject.alerts.find((a) => Number(a.type) === 2);
        const deprivationAlerts = subject.alerts
          .filter((a) => Number(a.type) === 3)
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );

        const rowData: any[] = [
          s.studentName,
          s.studyYear === 1 ? "سنة أولى" : "سنة ثانية",
          subject.subjectName,
          subject.absenceCounts.absent,
          subject.absenceCounts.excusedAbsence,
          subject.absenceCounts.late,
          subject.absenceCounts.absent +
            subject.absenceCounts.late / 3 +
            subject.absenceCounts.excusedAbsence,
        ];

        // Add alert columns based on filter
        if (includeFirstWarning) {
          rowData.push(firstAlert ? "نعم" : "لا");
        }
        if (includeSecondWarning) {
          rowData.push(secondAlert ? "نعم" : "لا");
        }

        // Add deprivation columns
        if (includeDeprivation) {
          for (let i = 0; i < maxDeprivations; i++) {
            if (deprivationAlerts[i]) {
              const alert = deprivationAlerts[i];
              rowData.push("نعم");
              rowData.push(
                Number(alert.status) === 1
                  ? "معلق"
                  : Number(alert.status) === 2
                    ? "موافق عليه"
                    : "مرفوض",
              );
            } else {
              rowData.push("لا");
              rowData.push("-");
            }
          }
        }

        rows.push(rowData);
      });
    });

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(rows);
    if (!ws["!views"]) ws["!views"] = [];
    ws["!views"].push({ RTL: true });

    // Set column widths
    const baseWidths = [
      { wch: 25 }, // اسم الطالب
      { wch: 15 }, // السنة
      { wch: 25 }, // المادة
      { wch: 10 }, // غياب
      { wch: 11 }, // غياب بعذر
      { wch: 10 }, // متأخر
      { wch: 15 }, // عدد الغيابات الكلي
    ];

    if (includeFirstWarning) {
      baseWidths.push({ wch: 12 }); // الإنذار الأول
    }
    if (includeSecondWarning) {
      baseWidths.push({ wch: 12 }); // الإنذار الثاني
    }
    if (includeDeprivation) {
      for (let i = 0; i < maxDeprivations; i++) {
        baseWidths.push({ wch: 12 }); // الحرمان
        baseWidths.push({ wch: 15 }); // حالة الحرمان
      }
    }

    ws["!cols"] = baseWidths;
    XLSX.utils.book_append_sheet(newWb, ws, specName.substring(0, 31));
  }

  XLSX.writeFile(newWb, `${fileName}.xlsx`);
}
