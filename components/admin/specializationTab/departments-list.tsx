"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import {
  fetchDepartmentHeads,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  clearError,
} from "@/features/admin";
import {
  Building2,
  Plus,
  Search,
  ChevronLeft,
  Trash2,
  Pencil,
  Calendar,
  Settings,
  Lock,
} from "lucide-react";
import { Department, specializationsService } from "@/features/specialization";
import {
  academicYearService,
  type AcademicYearResponse,
} from "@/features/academicYear";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  promoteStudentsThunk,
  deleteAcademicYearThunk,
} from "@/features/specialization";

interface DepartmentsListProps {
  departments: Department[];
  onSelectDepartment: (dept: Department) => void;
}

export function DepartmentsList({
  departments,
  onSelectDepartment,
}: DepartmentsListProps) {
  const dispatch = useAppDispatch();
  const {
    departmentHeads,
    createDepartmentState,
    updateDepartmentState,
    deleteDepartmentState,
    fetchDepartmentsState,
  } = useAppSelector((state) => state.admin);
  const { promoteStudentsState, deleteProgramYearState } = useAppSelector(
    (state) => state.specializations,
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newDept, setNewDept] = useState({ name: "", headId: "" });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState<Department | null>(null);
  const [deleteDeptPassword, setDeleteDeptPassword] = useState("");
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [deptToUpdate, setDeptToUpdate] = useState<Department | null>(null);
  const [updateName, setUpdateName] = useState("");
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    show: boolean;
  }>({
    success: false,
    message: "",
    show: false,
  });

  // State for Academic Years
  const [academicYears, setAcademicYears] = useState<AcademicYearResponse[]>(
    [],
  );
  const [isAcademicYearDialogOpen, setIsAcademicYearDialogOpen] =
    useState(false);
  const [newAcademicYear, setNewAcademicYear] = useState("");
  const [academicYearError, setAcademicYearError] = useState<string | null>(
    null,
  );
  const [isManagementDialogOpen, setIsManagementDialogOpen] = useState(false);
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [isYearDeleteDialogOpen, setIsYearDeleteDialogOpen] = useState(false);
  const [yearToDelete, setYearToDelete] = useState<AcademicYearResponse | null>(
    null,
  );
  const [deleteYearPassword, setDeleteYearPassword] = useState("");
  const [selectedYearForPromotion, setSelectedYearForPromotion] =
    useState<string>("");

  useEffect(() => {
    loadAcademicYears();
  }, [dispatch]);

  const loadAcademicYears = async () => {
    try {
      const years = await academicYearService.getAllAcademicYears();
      setAcademicYears(years);
    } catch (error) {
      console.error("Failed to load academic years:", error);
    }
  };

  const handleCreateAcademicYear = async () => {
    const year = parseInt(newAcademicYear);
    if (!year || year < 2024 || year > 2100) {
      setAcademicYearError("الرجاء إدخال سنة صحيحة");
      return;
    }

    setAcademicYearError(null);
    try {
      await academicYearService.createAcademicYear({ year });
      await loadAcademicYears();
      setIsAcademicYearDialogOpen(false);
      setNewAcademicYear("");
    } catch (error) {
      setAcademicYearError(
        typeof error === "string" ? error : "فشل إنشاء السنة الأكاديمية",
      );
    }
  };

  const handleDeleteYear = async () => {
    if (!yearToDelete || !deleteYearPassword) return;

    try {
      const resultAction = await dispatch(
        deleteAcademicYearThunk({
          id: yearToDelete.academicYearId,
          password: deleteYearPassword,
        }),
      );

      if (deleteAcademicYearThunk.fulfilled.match(resultAction)) {
        await loadAcademicYears();
        setIsYearDeleteDialogOpen(false);
        setYearToDelete(null);
        setDeleteYearPassword("");
        setResult({
          success: true,
          message: "تم حذف السنة الأكاديمية بنجاح",
          show: true,
        });
      } else if (deleteAcademicYearThunk.rejected.match(resultAction)) {
        setResult({
          success: false,
          message:
            (resultAction.payload as string) || "فشل حذف السنة الأكاديمية",
          show: true,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: "حدث خطأ غير متوقع",
        show: true,
      });
    }
  };

  const handlePromoteStudents = async () => {
    if (!adminPassword || !selectedYearForPromotion) return;

    try {
      const resultAction = await dispatch(
        promoteStudentsThunk({
          academicYearId: parseInt(selectedYearForPromotion),
          adminPassword,
        }),
      );

      if (promoteStudentsThunk.fulfilled.match(resultAction)) {
        setIsPromoteDialogOpen(false);
        setAdminPassword("");
        setSelectedYearForPromotion("");
        setResult({
          success: true,
          message: "تمت ترقية الطلاب بنجاح",
          show: true,
        });
      } else if (promoteStudentsThunk.rejected.match(resultAction)) {
        setResult({
          success: false,
          message: (resultAction.payload as string) || "فشل ترقية الطلاب",
          show: true,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: "حدث خطأ غير متوقع",
        show: true,
      });
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsAddDialogOpen(open);
    if (!open) {
      dispatch(clearError());
      setNewDept({ name: "", headId: "" });
    }
  };

  const filteredDepts = departments.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAddDept = async () => {
    if (!newDept.name.trim()) return;

    try {
      const resultAction = await dispatch(
        createDepartment({
          name: newDept.name,
          headOfDepartmentId: newDept.headId || null,
        }),
      );

      if (createDepartment.fulfilled.match(resultAction)) {
        setIsAddDialogOpen(false);
        setNewDept({ name: "", headId: "" });
      }
    } catch (error) {
      console.error("Failed to create department:", error);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, dept: Department) => {
    e.stopPropagation();
    setDeptToDelete(dept);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deptToDelete || !deleteDeptPassword) return;

    try {
      await dispatch(
        deleteDepartment({ id: deptToDelete.id, password: deleteDeptPassword }),
      ).unwrap();
      setResult({
        success: true,
        message: "تم حذف القسم بنجاح",
        show: true,
      });
      setDeleteDialogOpen(false);
      setDeptToDelete(null);
      setDeleteDeptPassword("");
    } catch (error: any) {
      setResult({
        success: false,
        message: error || "فشل في حذف القسم",
        show: true,
      });
    }
  };

  const handleEditClick = (e: React.MouseEvent, dept: Department) => {
    e.stopPropagation();
    setDeptToUpdate(dept);
    setUpdateName(dept.name);
    setUpdateDialogOpen(true);
  };

  const handleUpdateConfirm = async () => {
    if (!deptToUpdate || !updateName.trim()) return;

    try {
      await dispatch(
        updateDepartment({ id: deptToUpdate.id, name: updateName }),
      ).unwrap();
      setResult({
        success: true,
        message: "تم تحديث القسم بنجاح",
        show: true,
      });
      setUpdateDialogOpen(false);
      setDeptToUpdate(null);
      setUpdateName("");
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "فشل في تحديث القسم",
        show: true,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center  gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">الأقسام الدراسية</h2>
          <p className="text-sm text-gray-500">
            اختر القسم لإدارة التخصصات التابعة له
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="بحث عن قسم..."
              className="pr-10 text-right bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            onClick={() => setIsAcademicYearDialogOpen(true)}
            variant="outline"
            className="gap-2 cursor-pointer shadow-sm"
          >
            <Calendar className="h-4 w-4" />
            إضافة سنة أكاديمية
          </Button>
          <Button
            onClick={() => setIsManagementDialogOpen(true)}
            variant="outline"
            className="gap-2 cursor-pointer shadow-sm text-orange-600 border-orange-200 hover:bg-orange-50"
          >
            <Settings className="h-4 w-4" />
            إدارة المنظومة
          </Button>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 gap-2 cursor-pointer shadow-sm"
          >
            <Plus className="h-4 w-4" />
            إضافة قسم جديد
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Loading State */}
        {fetchDepartmentsState.isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-4"
            >
              <div className="flex items-start justify-between">
                <Skeleton className="h-14 w-14 rounded-2xl" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-7 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}

        {!fetchDepartmentsState.isLoading &&
          filteredDepts.map((dept) => (
            <div
              key={dept.id}
              onClick={() => onSelectDepartment(dept)}
              className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer p-6 flex flex-col gap-4 overflow-hidden"
            >
              {/* Background Decoration */}
              <div className="absolute -left-4 -top-4 w-24 h-24 bg-blue-50/50 rounded-full blur-2xl group-hover:bg-blue-100/50 transition-colors" />

              <div className="flex items-start justify-between">
                <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <Building2 className="h-7 w-7" />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleEditClick(e, dept)}
                    className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDeleteClick(e, dept)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1 text-sm font-medium text-gray-400 group-hover:text-blue-600 transition-colors">
                    <span>إدارة القسم</span>
                    <ChevronLeft className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {dept.name}
                </h3>
                {dept.headName && (
                  <p className="text-gray-500 text-sm line-clamp-2">
                    رئيس القسم: {dept.headName}
                  </p>
                )}
              </div>
            </div>
          ))}

        {/* Empty State */}
        {!fetchDepartmentsState.isLoading && filteredDepts.length === 0 && (
          <div className="col-span-full py-20 bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center gap-4">
            <div className="h-16 w-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center">
              <Search className="h-8 w-8" />
            </div>
            <p className="text-gray-400 font-medium">
              لا توجد نتائج بحث مطابقة
            </p>
          </div>
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-right">إضافة قسم جديد</DialogTitle>
            <DialogDescription className="text-right">
              أدخل بيانات القسم الجديد هنا لتنظيم التخصصات
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="add-name" className="text-right">
                اسم القسم
              </Label>
              <Input
                id="add-name"
                value={newDept.name}
                onChange={(e) =>
                  setNewDept({ ...newDept, name: e.target.value })
                }
                className="text-right"
                placeholder="مثال: قسم الحاسوب"
              />
            </div>

            {createDepartmentState.error && (
              <p className="text-red-500 text-sm text-right">
                {createDepartmentState.error}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={handleAddDept}
              disabled={createDepartmentState.isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer"
            >
              {createDepartmentState.isLoading ? "جاري الحفظ..." : "حفظ القسم"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setDeleteDeptPassword("");
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-right">تأكيد الحذف</DialogTitle>
            <DialogDescription className="text-right">
              هل أنت متأكد من حذف القسم؟
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="text-right text-sm text-gray-600">
                سيتم حذف القسم:{" "}
                <span className="font-semibold">{deptToDelete?.name}</span>
              </p>
              <p className="text-right text-sm text-red-600 mt-2">
                هذا الإجراء لا يمكن التراجع عنه
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="delete-password" className="text-right">
                كلمة سر الإدارة
              </Label>
              <Input
                id="delete-password"
                type="password"
                value={deleteDeptPassword}
                onChange={(e) => setDeleteDeptPassword(e.target.value)}
                placeholder="••••••••"
                className="text-right"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteDeptPassword("");
              }}
              disabled={deleteDepartmentState.isLoading}
              className="cursor-pointer"
            >
              إلغاء
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteDepartmentState.isLoading || !deleteDeptPassword}
              className="cursor-pointer"
            >
              {deleteDepartmentState.isLoading ? "جاري الحذف..." : "حذف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-right">تحديث القسم</DialogTitle>
            <DialogDescription className="text-right">
              قم بتعديل بيانات القسم
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="update-name" className="text-right">
                اسم القسم
              </Label>
              <Input
                id="update-name"
                value={updateName}
                onChange={(e) => setUpdateName(e.target.value)}
                className="text-right"
                placeholder="مثال: قسم الحاسوب"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setUpdateDialogOpen(false)}
              disabled={updateDepartmentState.isLoading}
              className="cursor-pointer"
            >
              إلغاء
            </Button>
            <Button
              type="button"
              onClick={handleUpdateConfirm}
              disabled={updateDepartmentState.isLoading}
              className="cursor-pointer bg-blue-600 hover:bg-blue-700"
            >
              {updateDepartmentState.isLoading ? "جاري التحديث..." : "تحديث"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Result Dialog */}
      <Dialog
        open={result.show}
        onOpenChange={(show) => {
          setResult({ ...result, show });
        }}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle
              className={`text-right ${
                result.success ? "text-green-600" : "text-red-600"
              }`}
            >
              {result.success ? "تم بنجاح" : "خطأ"}
            </DialogTitle>
            <DialogDescription className="text-right">
              {result.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => {
                setResult({ ...result, show: false });
              }}
              className="w-full cursor-pointer"
            >
              موافق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Academic Year Dialog */}
      <Dialog
        open={isAcademicYearDialogOpen}
        onOpenChange={(open) => {
          setIsAcademicYearDialogOpen(open);
          if (!open) {
            setAcademicYearError(null);
            setNewAcademicYear("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-right">
              إضافة سنة أكاديمية جديدة
            </DialogTitle>
            <DialogDescription className="text-right">
              أدخل السنة الأكاديمية (مثال: 2026)
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {academicYearError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-right border border-red-100 italic">
                {academicYearError}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="academic-year" className="text-right">
                السنة الأكاديمية
              </Label>
              <Input
                id="academic-year"
                type="number"
                value={newAcademicYear}
                onChange={(e) => setNewAcademicYear(e.target.value)}
                placeholder="2026"
                className="text-right"
              />
            </div>
            <div className="bg-blue-50 p-3 rounded-lg text-sm text-right w-full overflow-hidden">
              <p className="text-blue-700 break-all leading-relaxed">
                السنوات الأكاديمية المتاحة:{" "}
                {academicYears.map((y) => y.year).join(" , ") || "لا يوجد"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleCreateAcademicYear}
              className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer"
            >
              حفظ السنة الأكاديمية
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Management Dialog */}
      <Dialog
        open={isManagementDialogOpen}
        onOpenChange={setIsManagementDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-right">إدارة المنظومة</DialogTitle>
            <DialogDescription className="text-right">
              إجراءات إدارية متقدمة للمنظومة
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-right border-b pb-2">
                حذف السنوات الأكاديمية
              </h4>
              <div className="max-h-[200px] overflow-y-auto space-y-2">
                {academicYears.length > 0 ? (
                  academicYears.map((year) => (
                    <div
                      key={year.academicYearId}
                      className="flex  justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                    >
                      <span className="font-medium text-gray-700">
                        السنة الأكاديمية: {year.year}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setYearToDelete(year);
                          setIsYearDeleteDialogOpen(true);
                        }}
                        className="text-red-500 cursor-pointer hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-gray-400 py-4">
                    لا توجد سنوات أكاديمية
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-sm font-semibold text-right border-b pb-2 text-blue-600">
                ترقية الطلاب
              </h4>
              <Button
                onClick={() => setIsPromoteDialogOpen(true)}
                variant="outline"
                className="w-full cursor-pointer gap-2 border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <Lock className="h-4 w-4" />
                ترقية الطلاب
              </Button>
              <p className="text-[10px] text-gray-400 text-right">
                * عند ترقية الطلاب، سيتم نقل الطلاب الناجحين إلى المستوى الدراسي
                التالي
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Year Confirmation Dialog */}
      <Dialog
        open={isYearDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsYearDeleteDialogOpen(open);
          if (!open) setDeleteYearPassword("");
        }}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-right text-red-600">
              تأكيد حذف السنة الأكاديمية
            </DialogTitle>
            <DialogDescription className="text-right">
              هل أنت متأكد من حذف السنة الأكاديمية {yearToDelete?.year}؟
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-right text-sm text-red-700 font-medium">
                تنبيه: هذا الإجراء سيقوم بحذف كافة البيانات المتعلقة بهذه السنة
                بشكل نهائي.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="delete-year-password" className="text-right">
                كلمة سر الإدارة
              </Label>
              <Input
                id="delete-year-password"
                type="password"
                value={deleteYearPassword}
                onChange={(e) => setDeleteYearPassword(e.target.value)}
                placeholder="••••••••"
                className="text-right"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsYearDeleteDialogOpen(false);
                setDeleteYearPassword("");
              }}
              disabled={deleteProgramYearState.isLoading}
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteYear}
              disabled={deleteProgramYearState.isLoading || !deleteYearPassword}
            >
              {deleteProgramYearState.isLoading
                ? "جاري الحذف..."
                : "حذف المخطط السنوي"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Promote Students Dialog */}
      <Dialog
        open={isPromoteDialogOpen}
        onOpenChange={(open) => {
          setIsPromoteDialogOpen(open);
          if (!open) setAdminPassword("");
        }}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-right">تأكيد ترقية الطلاب</DialogTitle>
            <DialogDescription className="text-right">
              يتطلب هذا الإجراء إدخال كلمة سر الإدارة للتأكيد
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="block text-right">السنة الأكاديمية</Label>
              <Select
                value={selectedYearForPromotion}
                onValueChange={setSelectedYearForPromotion}
              >
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="اختر السنة الأكاديمية" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem
                      key={year.academicYearId}
                      value={year.academicYearId.toString()}
                      className="justify-end"
                    >
                      {year.year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="block text-right">كلمة سر الإدارة</Label>
              <Input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="text-right"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsPromoteDialogOpen(false)}
              disabled={promoteStudentsState.isLoading}
            >
              إلغاء
            </Button>
            <Button
              onClick={handlePromoteStudents}
              disabled={promoteStudentsState.isLoading || !adminPassword}
              className="bg-blue-600 hover:bg-blue-700 font-bold"
            >
              {promoteStudentsState.isLoading
                ? "جاري المعالجة..."
                : "تأكيد الترقية"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
