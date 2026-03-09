// // ─── Mock Data for Specializations Absences Feature ──────────────────────────

// export type StudyYear = 1 | 2;

// export interface MockSpecialization {
//   specializationId: number;
//   name: string;
//   departmentId: number;
//   departmentName: string;
//   yearsNumber: number; // 1 or 2
//   studentCount: number;
// }

// export interface MockSemester {
//   semesterId: number;
//   name: string;
//   academicYearId: number;
//   academicYear: number;
// }

// export interface MockMonth {
//   id: number;
//   name: string;
// }

// export interface MockSubject {
//   subjectId: number;
//   name: string;
//   teacherName: string;
//   numberOfHours: number;
//   studyYear: number;
//   semesterId: number;
//   specializationId: number;
// }

// export interface MockStudent {
//   studentId: number;
//   fullName: string;
//   username: string;
//   studentAcademicInfoId: number;
//   specializationId: number;
//   studyYear: number;
// }

// export interface MockAbsenceLesson {
//   lessonId: number;
//   lessonName: string;
//   status: string; // "Absent" | "Late" | "ExcusedAbsence"
// }

// export interface MockAbsenceDay {
//   date: string;
//   dayOfWeek: string;
//   totalAbsencesOnDate: number;
//   lessons: MockAbsenceLesson[];
// }

// export interface MockStudentAbsence {
//   studentId: number;
//   studentAcademicInfoId: number;
//   fullName: string;
//   subjectId: number;
//   subjectName: string;
//   totalAbsences: number;
//   absencesByDate: MockAbsenceDay[];
// }

// // ─── Specializations ─────────────────────────────────────────────────────────
// export const mockSpecializations: MockSpecialization[] = [
//   {
//     specializationId: 1,
//     name: "علوم الحاسوب",
//     departmentId: 10,
//     departmentName: "قسم تقنية المعلومات",
//     yearsNumber: 2,
//     studentCount: 48,
//   },
//   {
//     specializationId: 2,
//     name: "نظم معلومات الأعمال",
//     departmentId: 10,
//     departmentName: "قسم تقنية المعلومات",
//     yearsNumber: 2,
//     studentCount: 36,
//   },
//   {
//     specializationId: 3,
//     name: "أمن المعلومات",
//     departmentId: 10,
//     departmentName: "قسم تقنية المعلومات",
//     yearsNumber: 1,
//     studentCount: 22,
//   },
//   {
//     specializationId: 4,
//     name: "الشبكات والاتصالات",
//     departmentId: 10,
//     departmentName: "قسم تقنية المعلومات",
//     yearsNumber: 2,
//     studentCount: 30,
//   },
// ];

// // ─── Semesters ────────────────────────────────────────────────────────────────
// export const mockSemesters: MockSemester[] = [
//   { semesterId: 1, name: "الفصل الأول", academicYearId: 1, academicYear: 2024 },
//   {
//     semesterId: 2,
//     name: "الفصل الثاني",
//     academicYearId: 1,
//     academicYear: 2024,
//   },
//   { semesterId: 3, name: "الفصل الأول", academicYearId: 2, academicYear: 2025 },
//   {
//     semesterId: 4,
//     name: "الفصل الثاني",
//     academicYearId: 2,
//     academicYear: 2025,
//   },
// ];

// export const mockMonths: MockMonth[] = [
//   { id: 1, name: "يناير" },
//   { id: 2, name: "فبراير" },
//   { id: 3, name: "مارس" },
//   { id: 4, name: "أبريل" },
//   { id: 5, name: "مايو" },
//   { id: 6, name: "يونيو" },
//   { id: 7, name: "يوليو" },
//   { id: 8, name: "أغسطس" },
//   { id: 9, name: "سبتمبر" },
//   { id: 10, name: "أكتوبر" },
//   { id: 11, name: "نوفمبر" },
//   { id: 12, name: "ديسمبر" },
// ];

// // ─── Subjects ─────────────────────────────────────────────────────────────────
// export const mockSubjects: MockSubject[] = [
//   // Specialization 1, Year 1
//   {
//     subjectId: 101,
//     name: "مقدمة في البرمجة",
//     teacherName: "د. أحمد الخطيب",
//     numberOfHours: 3,
//     studyYear: 1,
//     semesterId: 3,
//     specializationId: 1,
//   },
//   {
//     subjectId: 102,
//     name: "رياضيات الحاسوب",
//     teacherName: "د. سارة علي",
//     numberOfHours: 3,
//     studyYear: 1,
//     semesterId: 3,
//     specializationId: 1,
//   },
//   {
//     subjectId: 103,
//     name: "هياكل البيانات",
//     teacherName: "د. محمد نور",
//     numberOfHours: 3,
//     studyYear: 1,
//     semesterId: 4,
//     specializationId: 1,
//   },
//   // Specialization 1, Year 2
//   {
//     subjectId: 104,
//     name: "قواعد البيانات",
//     teacherName: "د. ريم الحسن",
//     numberOfHours: 3,
//     studyYear: 2,
//     semesterId: 3,
//     specializationId: 1,
//   },
//   {
//     subjectId: 105,
//     name: "الذكاء الاصطناعي",
//     teacherName: "د. خالد منصور",
//     numberOfHours: 3,
//     studyYear: 2,
//     semesterId: 3,
//     specializationId: 1,
//   },
//   {
//     subjectId: 106,
//     name: "الشبكات الحاسوبية",
//     teacherName: "د. نادية سالم",
//     numberOfHours: 3,
//     studyYear: 2,
//     semesterId: 4,
//     specializationId: 1,
//   },
//   // Specialization 2, Year 1
//   {
//     subjectId: 201,
//     name: "مبادئ المحاسبة",
//     teacherName: "د. عمر شاهين",
//     numberOfHours: 3,
//     studyYear: 1,
//     semesterId: 3,
//     specializationId: 2,
//   },
//   {
//     subjectId: 202,
//     name: "أنظمة المعلومات الإدارية",
//     teacherName: "د. لينا أبو سعيد",
//     numberOfHours: 3,
//     studyYear: 1,
//     semesterId: 3,
//     specializationId: 2,
//   },
//   // Specialization 3, Year 1
//   {
//     subjectId: 301,
//     name: "أمن الشبكات",
//     teacherName: "د. سامي درويش",
//     numberOfHours: 3,
//     studyYear: 1,
//     semesterId: 3,
//     specializationId: 3,
//   },
//   {
//     subjectId: 302,
//     name: "التشفير",
//     teacherName: "د. هند العمر",
//     numberOfHours: 3,
//     studyYear: 1,
//     semesterId: 4,
//     specializationId: 3,
//   },
//   // Specialization 4, Year 1
//   {
//     subjectId: 401,
//     name: "بروتوكولات الشبكة",
//     teacherName: "د. فراس سعيد",
//     numberOfHours: 3,
//     studyYear: 1,
//     semesterId: 3,
//     specializationId: 4,
//   },
//   {
//     subjectId: 402,
//     name: "الاتصالات الرقمية",
//     teacherName: "د. مايا كريم",
//     numberOfHours: 3,
//     studyYear: 1,
//     semesterId: 4,
//     specializationId: 4,
//   },
// ];

// // ─── Students ─────────────────────────────────────────────────────────────────
// export const mockStudents: MockStudent[] = [
//   // Specialization 1, Year 1
//   {
//     studentId: 1,
//     fullName: "أحمد محمد حسين",
//     username: "s2024001",
//     studentAcademicInfoId: 1001,
//     specializationId: 1,
//     studyYear: 1,
//   },
//   {
//     studentId: 2,
//     fullName: "فاطمة علي خالد",
//     username: "s2024002",
//     studentAcademicInfoId: 1002,
//     specializationId: 1,
//     studyYear: 1,
//   },
//   {
//     studentId: 3,
//     fullName: "عمر سالم أحمد",
//     username: "s2024003",
//     studentAcademicInfoId: 1003,
//     specializationId: 1,
//     studyYear: 1,
//   },
//   {
//     studentId: 4,
//     fullName: "ريم يوسف النجار",
//     username: "s2024004",
//     studentAcademicInfoId: 1004,
//     specializationId: 1,
//     studyYear: 1,
//   },
//   // Specialization 1, Year 2
//   {
//     studentId: 5,
//     fullName: "خالد عبد الله الصيad",
//     username: "s2023001",
//     studentAcademicInfoId: 2001,
//     specializationId: 1,
//     studyYear: 2,
//   },
//   {
//     studentId: 6,
//     fullName: "لينا حمدان العمر",
//     username: "s2023002",
//     studentAcademicInfoId: 2002,
//     specializationId: 1,
//     studyYear: 2,
//   },
//   {
//     studentId: 7,
//     fullName: "سامي محمود ناصر",
//     username: "s2023003",
//     studentAcademicInfoId: 2003,
//     specializationId: 1,
//     studyYear: 2,
//   },
//   // Specialization 3, Year 1
//   {
//     studentId: 8,
//     fullName: "نور الهدى رشيد",
//     username: "s2024010",
//     studentAcademicInfoId: 3001,
//     specializationId: 3,
//     studyYear: 1,
//   },
//   {
//     studentId: 9,
//     fullName: "وسام طيب سعد",
//     username: "s2024011",
//     studentAcademicInfoId: 3002,
//     specializationId: 3,
//     studyYear: 1,
//   },
// ];

// // ─── Absences ─────────────────────────────────────────────────────────────────
// const DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"];

// function makeAbsenceDay(
//   dateStr: string,
//   dayIndex: number,
//   lessons: MockAbsenceLesson[],
// ): MockAbsenceDay {
//   return {
//     date: dateStr,
//     dayOfWeek: DAYS[dayIndex],
//     totalAbsencesOnDate: lessons.length,
//     lessons,
//   };
// }

// export const mockStudentAbsences: MockStudentAbsence[] = [
//   // Student 1, Subject 101
//   {
//     studentId: 1,
//     studentAcademicInfoId: 1001,
//     fullName: "أحمد محمد حسين",
//     subjectId: 101,
//     subjectName: "مقدمة في البرمجة",
//     totalAbsences: 4,
//     absencesByDate: [
//       makeAbsenceDay("2025-10-05", 0, [
//         { lessonId: 1, lessonName: "المحاضرة الأولى", status: "Absent" },
//         { lessonId: 2, lessonName: "المحاضرة الثانية", status: "Absent" },
//         { lessonId: 3, lessonName: "المحاضرة الثانية", status: "Absent" },
//         { lessonId: 4, lessonName: "المحاضرة الثانية", status: "Absent" },
//         { lessonId: 5, lessonName: "المحاضرة الثانية", status: "Absent" },
//       ]),
//       makeAbsenceDay("2025-10-19", 0, [
//         { lessonId: 3, lessonName: "المحاضرة الثالثة", status: "Absent" },
//         {
//           lessonId: 4,
//           lessonName: "المحاضرة الرابعة",
//           status: "ExcusedAbsence",
//         },
//       ]),
//       makeAbsenceDay("2025-11-02", 0, [
//         { lessonId: 5, lessonName: "المحاضرة الأولى", status: "Absent" },
//       ]),
//     ],
//   },
//   // Student 2, Subject 101
//   {
//     studentId: 2,
//     studentAcademicInfoId: 1002,
//     fullName: "فاطمة علي خالد",
//     subjectId: 101,
//     subjectName: "مقدمة في البرمجة",
//     totalAbsences: 2,
//     absencesByDate: [
//       makeAbsenceDay("2025-10-05", 0, [
//         { lessonId: 10, lessonName: "المحاضرة الأولى", status: "Absent" },
//       ]),
//       makeAbsenceDay("2025-10-12", 0, [
//         { lessonId: 5, lessonName: "المحاضرة الأولى", status: "Late" },
//       ]),
//     ],
//   },
//   // Student 3, Subject 101 — no absences on most days, but let's add one
//   {
//     studentId: 3,
//     studentAcademicInfoId: 1003,
//     fullName: "عمر سالم أحمد",
//     subjectId: 101,
//     subjectName: "مقدمة في البرمجة",
//     totalAbsences: 1,
//     absencesByDate: [
//       makeAbsenceDay("2025-10-19", 0, [
//         { lessonId: 11, lessonName: "المحاضرة الأولى", status: "Absent" },
//       ]),
//     ],
//   },
//   // Student 4, Subject 101
//   {
//     studentId: 4,
//     studentAcademicInfoId: 1004,
//     fullName: "ريم يوسف النجار",
//     subjectId: 101,
//     subjectName: "مقدمة في البرمجة",
//     totalAbsences: 3,
//     absencesByDate: [
//       makeAbsenceDay("2025-10-05", 0, [
//         { lessonId: 6, lessonName: "المحاضرة الأولى", status: "Absent" },
//       ]),
//       makeAbsenceDay("2025-11-09", 0, [
//         { lessonId: 7, lessonName: "المحاضرة الأولى", status: "Absent" },
//         { lessonId: 8, lessonName: "المحاضرة الثانية", status: "Absent" },
//       ]),
//     ],
//   },
//   // Student 5, Subject 104
//   {
//     studentId: 5,
//     studentAcademicInfoId: 2001,
//     fullName: "خالد عبد الله الصياد",
//     subjectId: 104,
//     subjectName: "قواعد البيانات",
//     totalAbsences: 2,
//     absencesByDate: [
//       makeAbsenceDay("2025-10-07", 1, [
//         { lessonId: 9, lessonName: "المحاضرة الأولى", status: "Absent" },
//         { lessonId: 10, lessonName: "المحاضرة الثانية", status: "Late" },
//       ]),
//     ],
//   },
// ];

// // ─── Helper functions ─────────────────────────────────────────────────────────
// export function getSpecializationById(
//   id: number,
// ): MockSpecialization | undefined {
//   return mockSpecializations.find((s) => s.specializationId === id);
// }

// export function getStudentsBySpecializationAndYear(
//   specializationId: number,
//   studyYear: number,
// ): MockStudent[] {
//   return mockStudents.filter(
//     (s) => s.specializationId === specializationId && s.studyYear === studyYear,
//   );
// }

// export function getSubjectsBySpecializationAndYear(
//   specializationId: number,
//   studyYear: number,
//   semesterId: number,
// ): MockSubject[] {
//   return mockSubjects.filter(
//     (s) =>
//       s.specializationId === specializationId &&
//       s.studyYear === studyYear &&
//       s.semesterId === semesterId,
//   );
// }

// export function getStudentAbsences(
//   studentAcademicInfoId: number,
//   subjectId: number,
// ): MockStudentAbsence | undefined {
//   return mockStudentAbsences.find(
//     (a) =>
//       a.studentAcademicInfoId === studentAcademicInfoId &&
//       a.subjectId === subjectId,
//   );
// }
