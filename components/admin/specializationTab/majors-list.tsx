"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Settings, BookOpen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Major } from "@/features/specialization";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchSpecializations,
  createSpecialization,
  updateSpecialization,
  deleteSpecialization,
} from "@/features/specialization";
import { useIsMobile } from "@/hooks/use-mobile";

interface MajorsListProps {
  majors: Major[];
  onSelectMajor: (major: Major) => void;
  departmentId?: string;
}

export function MajorsList({
  majors,
  onSelectMajor,
  departmentId,
}: MajorsListProps) {
  const dispatch = useAppDispatch();
  const {
    specializations,
    fetchSpecializationsState,
    updateSpecializationState,
    deleteSpecializationState,
  } = useAppSelector((state) => state.specializations);
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMajorForAction, setSelectedMajorForAction] =
    useState<Major | null>(null);

  // Error States for Dialogs
  const [addError, setAddError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const [newMajor, setNewMajor] = useState({
    name: "",
    yearsNumber: 2,
  });

  // Fetch specializations on mount
  useEffect(() => {
    dispatch(fetchSpecializations());
  }, [dispatch]);

  // Map specializations to majors format for display
  const apiMajors: Major[] = specializations
    .filter((s) => !departmentId || s.departmentId.toString() === departmentId)
    .map((s) => ({
      id: s.specializationId.toString(),
      name: s.name,
      departmentId: s.departmentId,
      yearsCount: s.yearsNumber,
      studentCount: 0,
      years: [],
    }));

  // Use the majors from props if provided and not empty, otherwise use Redux-derived apiMajors
  const allMajors = majors && majors.length > 0 ? majors : apiMajors;

  const filteredMajors = allMajors.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAddMajor = async () => {
    if (!newMajor.name.trim() || !departmentId) return;
    setAddError(null);

    try {
      await dispatch(
        createSpecialization({
          name: newMajor.name,
          departmentId: parseInt(departmentId),
          yearsNumber: newMajor.yearsNumber,
        }),
      ).unwrap();

      setIsAddDialogOpen(false);
      setNewMajor({ name: "", yearsNumber: 2 });
    } catch (error) {
      setAddError(typeof error === "string" ? error : "فشل إضافة التخصص");
    }
  };

  const handleEditMajor = async () => {
    if (
      !selectedMajorForAction ||
      !newMajor.name.trim() ||
      !departmentId ||
      !newMajor.yearsNumber ||
      newMajor.yearsNumber == 0
    )
      return;

    // If name and yearsNumber haven't changed, just close
    if (
      newMajor.name === selectedMajorForAction.name &&
      newMajor.yearsNumber === selectedMajorForAction.yearsCount
    ) {
      setIsEditDialogOpen(false);
      return;
    }

    setEditError(null);

    try {
      await dispatch(
        updateSpecialization({
          id: parseInt(selectedMajorForAction.id),
          name: newMajor.name,
          departmentId: parseInt(departmentId),
          yearsNumber: newMajor.yearsNumber,
        }),
      ).unwrap();

      setIsEditDialogOpen(false);
      setSelectedMajorForAction(null);
      setNewMajor({ name: "", yearsNumber: 2 });
    } catch (error) {
      setEditError(typeof error === "string" ? error : "فشل تعديل التخصص");
    }
  };
  const [deleteDeptPassword, setDeleteDeptPassword] = useState("");
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    show: boolean;
  }>({
    success: false,
    message: "",
    show: false,
  });

  const handleDeleteMajor = async () => {
    if (!selectedMajorForAction || !deleteDeptPassword) return;

    try {
      await dispatch(
        deleteSpecialization({
          id: parseInt(selectedMajorForAction.id),
          password: deleteDeptPassword,
        }),
      ).unwrap();
      setResult({
        success: true,
        message: "تم حذف التخصص بنجاح",
        show: true,
      });
      setIsDeleteDialogOpen(false);
      setDeleteDeptPassword("");
      setSelectedMajorForAction(null);
    } catch (error: any) {
      setResult({
        success: false,
        message: error || "فشل في حذف القسم",
        show: true,
      });
    }
  };

  const openEditDialog = (major: Major) => {
    setSelectedMajorForAction(major);
    setNewMajor({ name: major.name, yearsNumber: major.yearsCount });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (major: Major, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMajorForAction(major);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 md:p-6 border-b border-gray-50 space-y-4 md:space-y-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-900">قائمة التخصصات</h2>
            <p className="text-sm text-gray-500">
              إدارة جميع التخصصات الدراسية في الكلية
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => {
                setNewMajor({ name: "", yearsNumber: 2 });
                setIsAddDialogOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 gap-2 cursor-pointer shadow-sm w-full sm:w-auto justify-center"
            >
              <Plus className="h-4 w-4" />
              إضافة تخصص جديد
            </Button>
          </div>
        </div>
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

        {/* Search Bar */}
        <div className="relative w-full md:max-w-md mr-auto">
          <label htmlFor="search-majors" className="sr-only">
            البحث عن تخصص
          </label>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            id="search-majors"
            type="text"
            placeholder="البحث باسم التخصص..."
            className="pr-10 text-right bg-gray-50/50 border-gray-200 focus:bg-white transition-all shadow-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto min-h-[400px]">
        {isMobile ? (
          <div className="p-4 space-y-4">
            {/* Loading State */}
            {fetchSpecializationsState.isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 space-y-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                      </div>
                    </div>
                  </div>
                  <Skeleton className="h-8 w-full rounded-md" />
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                    <Skeleton className="h-9 w-9 rounded-md" />
                    <Skeleton className="h-9 w-9 rounded-md" />
                  </div>
                </div>
              ))}

            {!fetchSpecializationsState.isLoading &&
            filteredMajors.length > 0 ? (
              filteredMajors.map((major) => (
                <div
                  key={major.id}
                  className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 space-y-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-100/50 text-blue-600 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div className="text-right">
                        <h3 className="font-bold text-gray-900 uppercase">
                          {major.name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="flex">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectMajor(major)}
                      className="w-full gap-1 border-blue-100 text-blue-600 hover:bg-blue-50 cursor-pointer text-xs"
                    >
                      <Settings className="h-3.5 w-3.5" />
                      إدارة
                    </Button>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(major)}
                      className="h-9 w-9 text-amber-600 hover:text-amber-700 hover:bg-amber-50 cursor-pointer"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => openDeleteDialog(major, e)}
                      className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : !fetchSpecializationsState.isLoading ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
                  <Search className="h-8 w-8" />
                </div>
                <p className="text-gray-500 font-medium">
                  لم يتم العثور على نتائج
                </p>
                <p className="text-sm text-gray-400">حاول البحث بكلمة أخرى</p>
              </div>
            ) : null}
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="hover:bg-transparent border-b border-gray-100 justify-between">
                <TableHead className="py-5 px-6 font-bold text-gray-900">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-blue-100/50 text-blue-600 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <span className="text-base">اسم التخصص</span>
                  </div>
                </TableHead>

                <TableHead className="py-5 px-6 font-bold text-gray-900">
                  خيارات التحكم
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Loading State */}
              {fetchSpecializationsState.isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-gray-50">
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-6 w-48" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Skeleton className="h-8 w-20 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

              {!fetchSpecializationsState.isLoading &&
                filteredMajors.map((major) => (
                  <TableRow
                    key={major.id}
                    className="hover:bg-blue-50/20 transition-all border-b border-gray-50 group"
                  >
                    <TableCell className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors uppercase">
                          {major.name}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onSelectMajor(major)}
                          className="gap-1 border-blue-100 text-blue-600 hover:bg-blue-50 cursor-pointer"
                        >
                          <Settings className="h-3.5 w-3.5" />
                          إدارة
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(major)}
                          className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 cursor-pointer"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => openDeleteDialog(major, e)}
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Add Specialization Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) setAddError(null);
        }}
      >
        <DialogContent className="sm:max-w-[425px] w-[95vw] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-right">إضافة تخصص جديد</DialogTitle>
            <DialogDescription className="text-right">
              أدخل بيانات التخصص الجديد هنا
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {addError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-right border border-red-100 italic">
                {addError}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="add-name" className="text-right">
                اسم التخصص
              </Label>
              <Input
                id="add-name"
                value={newMajor.name}
                onChange={(e) =>
                  setNewMajor({ ...newMajor, name: e.target.value })
                }
                className="text-right"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-years" className="text-right">
                عدد السنوات الدراسية
              </Label>
              <Input
                id="add-years"
                type="number"
                min="1"
                max="2"
                value={newMajor.yearsNumber}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value >= 1 && value <= 2) {
                    setNewMajor({ ...newMajor, yearsNumber: value });
                  }
                }}
                className="text-right"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleAddMajor}
              className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer"
            >
              حفظ التخصص
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Specialization Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setSelectedMajorForAction(null);
            setNewMajor({ name: "", yearsNumber: 2 });
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px] w-[95vw] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-right">تعديل التخصص</DialogTitle>
            <DialogDescription className="text-right">
              تعديل بيانات تخصص {selectedMajorForAction?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {editError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-right border border-red-100 italic">
                {editError}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="edit-name" className="text-right">
                اسم التخصص
              </Label>
              <Input
                id="edit-name"
                value={newMajor.name}
                onChange={(e) =>
                  setNewMajor({ ...newMajor, name: e.target.value })
                }
                className="text-right"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-years" className="text-right">
                عدد السنوات الدراسية
              </Label>
              <Input
                id="edit-years"
                type="number"
                min="1"
                max="2"
                value={newMajor.yearsNumber}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value >= 1 && value <= 2) {
                    setNewMajor({ ...newMajor, yearsNumber: value });
                  }
                }}
                className="text-right"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleEditMajor}
              disabled={updateSpecializationState.isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer"
            >
              {updateSpecializationState.isLoading
                ? "جاري الحفظ..."
                : "حفظ التعديلات"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Specialization Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px] w-[95vw] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-right">حذف التخصص</DialogTitle>
            <DialogDescription className="text-right">
              هل أنت متأكد من حذف تخصص{" "}
              <span className="font-bold text-red-600">
                {selectedMajorForAction?.name}
              </span>
              ؟ سيتم حذف جميع البيانات المتعلقة به نهائياً.
            </DialogDescription>
          </DialogHeader>
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
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeleteDeptPassword("");
              }}
              className="flex-1 cursor-pointer"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleDeleteMajor}
              disabled={
                deleteSpecializationState.isLoading || !deleteDeptPassword
              }
              className="flex-1 bg-red-600 hover:bg-red-700 cursor-pointer"
            >
              {deleteSpecializationState.isLoading
                ? "جاري الحذف..."
                : "تأكيد الحذف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
