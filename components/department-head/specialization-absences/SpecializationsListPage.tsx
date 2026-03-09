"use client";

import { useRouter } from "next/navigation";
import { useMemo, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchHeadOfDepartmentSpecializations } from "@/features/specialization/specializationsSlice";
import { SpecializationResponse } from "@/features/specialization";
import { Loader2 } from "lucide-react";

interface ApiSpecialization {
  SpecializationId: number;
  Name: string;
  DepartmentId: number;
  DepartmentName: string;
  YearsNumber: number;
  StudentCount: number;
}

// Icon Components
function GraduationCapIcon() {
  return (
    <svg
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 14l9-5-9-5-9 5 9 5z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
      />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
    </svg>
  );
}

function YearsIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

function SpecializationCard({
  spec,
  onClick,
}: {
  spec: SpecializationResponse;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative  overflow-hidden rounded-xl bg-white border-2 transition-all duration-300 cursor-pointer ${
        hovered
          ? "border-blue-600 shadow-[0_12px_30px_-8px_rgba(37,99,235,0.15)] -translate-y-1.5"
          : "border-gray-100 shadow-sm"
      }`}
    >
      <div className="p-6">
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors duration-300 ${
            hovered ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600"
          } mb-5`}
        >
          <GraduationCapIcon />
        </div>

        <h3
          className="text-base font-black text-gray-900 mb-1.5 leading-tight"
          dir="rtl"
        >
          {spec.name}
        </h3>
        <p
          className="text-[11px] text-gray-500 mb-5 font-bold uppercase tracking-tight"
          dir="rtl"
        >
          {spec.departmentName}
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2.5 text-xs" dir="rtl">
            <span className="w-8 h-8 rounded-md bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
              <UsersIcon />
            </span>
            <div className="flex flex-col">
              <span className="text-gray-400 font-bold text-[10px]">
                الطلاب
              </span>
              <span className="text-gray-900 font-black">
                {spec.studentCount ?? 0} طالب
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-xs" dir="rtl">
            <span className="w-8 h-8 rounded-md bg-slate-50 flex items-center justify-center text-slate-400">
              <YearsIcon />
            </span>
            <div className="flex flex-col">
              <span className="text-gray-400 font-bold text-[10px]">المدة</span>
              <span className="text-gray-900 font-black">
                {spec.yearsNumber === 1 ? "سنة دراسية" : "سنتان دراسيتان"}
              </span>
            </div>
          </div>
        </div>

        <button
          className={`w-full cursor-pointer py-2.5 rounded-lg text-xs font-black tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${
            hovered
              ? "bg-blue-600 text-white shadow-md shadow-blue-200"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          <span>عرض التفاصيل</span>
          <svg
            className={`h-3.5 w-3.5 rotate-180 transition-transform ${hovered ? "translate-x-1" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function SpecializationsListPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Get state from Redux
  const specializations = useAppSelector(
    (state) => state.specializations.specializations,
  );
  const { isLoading, error } = useAppSelector(
    (state) => state.specializations.fetchHeadOfDepartmentSpecializationsState,
  );

  useEffect(() => {
    dispatch(fetchHeadOfDepartmentSpecializations());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-slate-50/30 p-4" dir="rtl">
      {/* Official Header */}
      <div className="bg-white border-b border-gray-200 -mt-6  mb-8 px-8 py-10 rounded-b-[40px] shadow-sm relative overflow-hidden ">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-600 p-2 rounded-lg">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <span className="text-blue-600 text-xs font-black uppercase tracking-widest">
              إدارة التخصصات
            </span>
          </div>

          <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">
            التخصصات الدراسية
          </h1>
          {/* <p className="text-gray-500 text-sm max-w-2xl font-bold leading-relaxed">
            البوابة الإدارية لمتابعة غيابات الطلاب والتحصيل الدراسي. يمكنك تصفح
            التخصصات المتاحة والوصول إلى التقارير التفصيلية لكل مادة.
          </p> */}

          <div className="mt-8 flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">
                إجمالي التخصصات
              </span>
              <span className="text-2xl font-black text-gray-900 flex items-center gap-2">
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                ) : (
                  specializations.length
                )}
              </span>
            </div>
            <div className="w-px h-10 bg-gray-100" />
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">
                الطلاب المسجلين
              </span>
              <span className="text-2xl font-black text-gray-900 flex items-center gap-2">
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                ) : (
                  specializations
                    .reduce((a, b) => a + (b.studentCount ?? 0), 0)
                    .toLocaleString()
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      {/* <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
        <div className="relative flex-1 w-full">
          <svg
            className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث عن اسم التخصص..."
            className="w-full bg-white border-2 border-gray-100 rounded-xl pr-12 pl-4 py-3 text-sm text-gray-900 font-bold placeholder-gray-400 focus:outline-none focus:border-blue-600 transition-all shadow-sm"
          />
        </div>
      </div> */}

      {/* Cards grid */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          // Loading Skeletons
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-xl bg-gray-100 animate-pulse border-2 border-gray-50"
            />
          ))
        ) : error ? (
          <div className="col-span-full bg-red-50 border-2 border-red-100 p-8 rounded-2xl text-center">
            <p className="text-red-600 font-black mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-white bg-red-600 px-6 py-2 rounded-lg font-black text-sm hover:bg-red-700 transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : specializations.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
            <p className="text-slate-400 font-black text-lg">
              لا يوجد تخصصات متاحة للقسم حالياً
            </p>
          </div>
        ) : (
          specializations.map((spec) => (
            <SpecializationCard
              key={spec.specializationId}
              spec={spec}
              onClick={() =>
                router.push(
                  `/department-head/specializations/${spec.specializationId}`,
                )
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
