// export type Student = {
//   id: string;
//   name: string;
//   studentNumber: string;
//   department: string;
//   section: string;
//   level: string;
//   absenceCount: number;
//   attendanceRate: number;
// };

// export type Teacher = {
//   id: string;
//   name: string;
//   email: string;
//   department: string;
//   sections: string[];
//   studentsCount: number;
// };

// export type AbsenceRecord = {
//   id: string;
//   studentId: string;
//   studentName: string;
//   date: string;
//   section: string;
//   count: number; // number of absences recorded in this entry
//   type: "absence" | "late" | "excused"; // غياب أو تأخير أو بعذر
//   isExcused: boolean; // غياب بعذر
//   reason?: string;
//   recordedBy: string;
// };

// export type Warning = {
//   id: string;
//   studentId: string;
//   studentName: string;
//   studentNumber: string;
//   department: string;
//   section: string;
//   warningText: string;
//   sentBy: string;
//   sentByEmail: string;
//   date: string;
//   severity: "low" | "medium" | "high";
//   isRead: boolean;
// };

// export const mockTeachers: Teacher[] = [
//   {
//     id: "1",
//     name: "أحمد محمد العلي",
//     email: "ahmad.ali@school.edu",
//     department: "علوم الحاسب",
//     sections: ["CS-101-A", "CS-102-B"],
//     studentsCount: 65,
//   },
//   {
//     id: "2",
//     name: "فاطمة حسن السالم",
//     email: "fatima.salem@school.edu",
//     department: "الرياضيات",
//     sections: ["MATH-201-A", "MATH-202-C"],
//     studentsCount: 58,
//   },
//   {
//     id: "3",
//     name: "خالد عبدالله الشمري",
//     email: "khaled.shamri@school.edu",
//     department: "الفيزياء",
//     sections: ["PHY-101-B", "PHY-201-A"],
//     studentsCount: 52,
//   },
//   {
//     id: "4",
//     name: "نورة سعد القحطاني",
//     email: "noura.qahtani@school.edu",
//     department: "الكيمياء",
//     sections: ["CHEM-101-A"],
//     studentsCount: 35,
//   },
//   {
//     id: "5",
//     name: "محمد علي الغامدي",
//     email: "mohammed.ghamdi@school.edu",
//     department: "علوم الحاسب",
//     sections: ["CS-201-C", "CS-301-A"],
//     studentsCount: 48,
//   },
// ];

// export const mockStudents: Student[] = [
//   {
//     id: "1",
//     name: "عبدالرحمن أحمد المطيري",
//     studentNumber: "2024001",
//     department: "علوم الحاسب",
//     section: "CS-101-A",
//     level: "المستوى الأول",
//     absenceCount: 3,
//     attendanceRate: 92,
//   },
//   {
//     id: "2",
//     name: "سارة محمد العتيبي",
//     studentNumber: "2024002",
//     department: "علوم الحاسب",
//     section: "CS-101-A",
//     level: "المستوى الأول",
//     absenceCount: 1,
//     attendanceRate: 97,
//   },
//   {
//     id: "3",
//     name: "يوسف خالد الدوسري",
//     studentNumber: "2024003",
//     department: "الرياضيات",
//     section: "MATH-201-A",
//     level: "المستوى الثاني",
//     absenceCount: 5,
//     attendanceRate: 86,
//   },
//   {
//     id: "4",
//     name: "لينا سعد الشهري",
//     studentNumber: "2024004",
//     department: "الفيزياء",
//     section: "PHY-101-B",
//     level: "المستوى الأول",
//     absenceCount: 2,
//     attendanceRate: 95,
//   },
//   {
//     id: "5",
//     name: "عمر فهد القرني",
//     studentNumber: "2024005",
//     department: "علوم الحاسب",
//     section: "CS-201-C",
//     level: "المستوى الثاني",
//     absenceCount: 7,
//     attendanceRate: 80,
//   },
//   {
//     id: "6",
//     name: "مريم عبدالله الزهراني",
//     studentNumber: "2024006",
//     department: "الكيمياء",
//     section: "CHEM-101-A",
//     level: "المستوى الأول",
//     absenceCount: 0,
//     attendanceRate: 100,
//   },
//   {
//     id: "7",
//     name: "فيصل محمد الحربي",
//     studentNumber: "2024007",
//     department: "علوم الحاسب",
//     section: "CS-101-A",
//     level: "المستوى الأول",
//     absenceCount: 4,
//     attendanceRate: 89,
//   },
//   {
//     id: "8",
//     name: "ريم سلطان العمري",
//     studentNumber: "2024008",
//     department: "الرياضيات",
//     section: "MATH-201-A",
//     level: "المستوى الثاني",
//     absenceCount: 2,
//     attendanceRate: 94,
//   },
//   {
//     id: "9",
//     name: "طارق عبدالعزيز السبيعي",
//     studentNumber: "2024009",
//     department: "الفيزياء",
//     section: "PHY-201-A",
//     level: "المستوى الثاني",
//     absenceCount: 6,
//     attendanceRate: 83,
//   },
//   {
//     id: "10",
//     name: "هند راشد العنزي",
//     studentNumber: "2024010",
//     department: "علوم الحاسب",
//     section: "CS-301-A",
//     level: "المستوى الثالث",
//     absenceCount: 1,
//     attendanceRate: 97,
//   },
// ];

// export const mockAbsences: AbsenceRecord[] = [
//   {
//     id: "1",
//     studentId: "1",
//     studentName: "عبدالرحمن أحمد المطيري",
//     date: "2024-01-15",
//     section: "CS-101-A",
//     count: 1,
//     type: "absence",
//     isExcused: true,
//     reason: "مرض",
//     recordedBy: "أحمد محمد العلي",
//   },
//   {
//     id: "2",
//     studentId: "3",
//     studentName: "يوسف خالد الدوسري",
//     date: "2024-01-16",
//     section: "MATH-201-A",
//     count: 1,
//     type: "late",
//     isExcused: false,
//     reason: "ظرف خاص",
//     recordedBy: "فاطمة حسن السالم",
//   },
//   {
//     id: "3",
//     studentId: "5",
//     studentName: "عمر فهد القرني",
//     date: "2024-01-17",
//     section: "CS-201-C",
//     count: 1,
//     type: "absence",
//     isExcused: false,
//     recordedBy: "محمد علي الغامدي",
//   },
// ];

// export const mockWarnings: Warning[] = [
//   {
//     id: "1",
//     studentId: "5",
//     studentName: "عمر فهد القرني",
//     studentNumber: "2024005",
//     department: "علوم الحاسب",
//     section: "CS-201-C",
//     warningText: "تجاوز الطالب 7 غيابات، يرجى الانتباه والحضور بانتظام",
//     sentBy: "محمد علي الغامدي",
//     sentByEmail: "mohammed.ghamdi@school.edu",
//     date: "2024-01-15",
//     severity: "high",
//     isRead: false,
//   },
//   {
//     id: "2",
//     studentId: "9",
//     studentName: "طارق عبدالعزيز السبيعي",
//     studentNumber: "2024009",
//     department: "الفيزياء",
//     section: "PHY-201-A",
//     warningText: "انخفاض مستوى الحضور، يحتاج الطالب إلى متابعة",
//     sentBy: "خالد عبدالله الشمري",
//     sentByEmail: "khaled.shamri@school.edu",
//     date: "2024-01-16",
//     severity: "medium",
//     isRead: false,
//   },
// ];
