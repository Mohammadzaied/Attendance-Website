"use client";

import { useEffect, useState, useMemo, use } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchSubjectStudents } from "@/features/teacher";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Search,
  ChevronRight,
  ArrowRight,
  FileBarChart,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StudentAbsenceDetailsDialog } from "@/components/teacher/student-absence-details-dialog";
import { fetchSubjectStudentsWithAbsenceData } from "@/features/teacher";
import { useParams } from "next/navigation";

export default function SubjectStudentsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  // const { subjectId } = use(params);
  const params = useParams();
  const subjectId = params.subjectId; // string | undefined
  const {
    students,
    subjectName,
    fetchStudentsState,
    subjects,
    subjectAbsenceData,
    fetchSubjectAbsenceDataState,
  } = useAppSelector((state) => state.teacher);

  const [searchQuery, setSearchQuery] = useState("");
  const [isAbsenceDialogOpen, setIsAbsenceDialogOpen] = useState(false);

  useEffect(() => {
    if (subjectId) {
      dispatch(fetchSubjectStudents(Number(subjectId)));
    }
    window.scrollTo(0, 0);
  }, [subjectId, dispatch]);

  const currentSubject = useMemo(() => {
    if (!subjects || subjectId === null) return null;

    return subjects.find((s) => s.subjectId === Number(subjectId));
  }, [subjects, subjectId]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    return students.filter((student) =>
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [students, searchQuery]);

  return (
    <div
      className="space-y-6 md:space-y-8 px-4 md:px-0 max-w-7xl mx-auto pb-10"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-right">
          <div className="flex items-center gap-2 mb-2">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="w-fit self-start md:self-center gap-2"
            >
              للخلف <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
            قائمة الطلاب:{" "}
            {fetchStudentsState.isLoading
              ? "تحميل..."
              : subjectName || "المادة غير موجودة"}
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            عرض سجلات الغياب لكل طالب
          </p>
        </div>
      </div>

      {/* Absence Statistics Button */}
      <Card className="shadow-sm border-blue-100 bg-linear-to-br from-blue-50 to-white overflow-hidden rounded-xl">
        <CardContent className="p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-right">
              <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <FileBarChart className="h-5 w-5 text-blue-600" />
                إحصائيات الغياب التفصيلية
              </h3>
              <p className="text-sm text-gray-600">
                عرض إحصائيات الغياب لجميع الطلاب مع إمكانية التصدير إلى Excel
              </p>
            </div>
            <Button
              onClick={() => {
                dispatch(
                  fetchSubjectStudentsWithAbsenceData(Number(subjectId)),
                );
                setIsAbsenceDialogOpen(true);
              }}
              disabled={
                fetchSubjectAbsenceDataState.isLoading || students.length === 0
              }
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white gap-2 h-11 font-bold shadow-lg shadow-blue-600/20"
            >
              <FileBarChart className="h-4 w-4" />
              {fetchSubjectAbsenceDataState.isLoading
                ? "جاري التحميل..."
                : "عرض الإحصائيات"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search and Stats */}
      <Card className="shadow-sm border-gray-100 overflow-hidden rounded-xl bg-white">
        <CardContent className="p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="البحث عن اسم الطالب..."
                className="pr-10 text-right h-11"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 self-end md:self-center">
              <Badge className="bg-blue-50 text-blue-700 border-blue-200 px-4 py-2 text-sm font-bold">
                <Users className="h-4 w-4 ml-2" />
                {filteredStudents.length} / {students.length} طالب
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      {fetchStudentsState.isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
          <div className="h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-medium text-lg">جاري تحميل قائمة الطلاب...</p>
        </div>
      ) : filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <Link
              key={student.studentId}
              href={`/teacher/subjects/student-absences/${subjectId}/${student.studentAcademicInfoId}`}
              className="block group"
            >
              <Card className="h-full border-gray-100 group-hover:border-blue-300 group-hover:shadow-md transition-all duration-200">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                    {student.fullName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <p className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                      {student.fullName}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      اضغط لعرض سجل الغياب
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-20 text-center shadow-xs">
          <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            لا يوجد نتائج
          </h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            {searchQuery
              ? "لم يتم العثور على طلاب يطابقون بحثك"
              : "لا يوجد طلاب مسجلين في هذه المادة"}
          </p>
          {searchQuery && (
            <Button
              variant="link"
              onClick={() => setSearchQuery("")}
              className="text-blue-600 font-bold mt-2"
            >
              إلغاء البحث
            </Button>
          )}
        </div>
      )}

      {/* Absence Details Dialog */}
      {subjectAbsenceData && (
        <StudentAbsenceDetailsDialog
          open={isAbsenceDialogOpen}
          onOpenChange={setIsAbsenceDialogOpen}
          students={subjectAbsenceData.students}
          subjectName={subjectAbsenceData.subjectName}
          subjectId={subjectAbsenceData.subjectId}
        />
      )}
    </div>
  );
}
