"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
// import { toast } from "sonner";
import { ResultDialog } from "@/components/shared/result-dialog";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { lessonService } from "@/features/lesson";
import { LessonResponse } from "@/features/lesson";

const lessonSchema = z.object({
  name: z.string().min(1),
  start: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  end: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
});

type LessonFormValues = z.infer<typeof lessonSchema>;

interface LessonsManagementDialogProps {
  children: React.ReactNode;
}

export function LessonsManagementDialog({
  children,
}: LessonsManagementDialogProps) {
  const [lessons, setLessons] = useState<LessonResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Result Dialog State
  const [resultState, setResultState] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant: "default" | "destructive";
  }>({
    open: false,
    title: "",
    message: "",
    variant: "default",
  });

  const showResult = (
    title: string,
    message: string,
    variant: "default" | "destructive" = "default",
  ) => {
    setResultState({ open: true, title, message, variant });
  };

  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      name: "",
      start: "",
      end: "",
    },
  });

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const data = await lessonService.getAllLessons();
      setLessons(data.filter((lesson) => lesson.isActive));
    } catch (error) {
      showResult("خطأ", "فشل جلب الحصص", "destructive");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLessons();
    }
  }, [isOpen]);

  const onSubmit = async (values: LessonFormValues) => {
    try {
      const formattedValues = {
        ...values,
        start: values.start.includes(":")
          ? values.start.split(":").length === 2
            ? `${values.start}:00`
            : values.start
          : values.start,
        end: values.end.includes(":")
          ? values.end.split(":").length === 2
            ? `${values.end}:00`
            : values.end
          : values.end,
      };

      if (editingId) {
        await lessonService.updateLesson(editingId, formattedValues);
        showResult("نجاح", "تم تحديث الحصة بنجاح");
      } else {
        await lessonService.createLesson(formattedValues);
        showResult("نجاح", "تم إضافة الحصة بنجاح");
      }
      form.reset();
      setEditingId(null);
      fetchLessons();
    } catch (error) {
      showResult(
        "خطأ",
        editingId ? "فشل تحديث الحصة" : "فشل إضافة الحصة",
        "destructive",
      );
    }
  };

  const onEdit = (lesson: LessonResponse) => {
    setEditingId(lesson.lessonId);
    form.setValue("name", lesson.name);
    // Remove seconds for the form input
    const formatTime = (time: string) => {
      const parts = time.split(":");
      return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : time;
    };
    form.setValue("start", formatTime(lesson.start));
    form.setValue("end", formatTime(lesson.end));
  };

  const onDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه الحصة؟")) return;
    try {
      await lessonService.deleteLesson(id);
      showResult("نجاح", "تم حذف الحصة بنجاح");
      fetchLessons();
    } catch (error) {
      showResult("خطأ", "فشل حذف الحصة", "destructive");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="w-[calc(100vw-2rem)] max-w-3xl! md:max-w-6xl! max-h-[90vh] overflow-y-auto"
        dir="rtl"
      >
        <DialogHeader>
          <DialogTitle className="text-right">جدول الحصص</DialogTitle>
          <DialogDescription className="text-right">
            إدارة الحصص الدراسية (إضافة، تعديل، حذف)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-muted/30 p-4 rounded-lg border"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم الحصة</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: الحصة الأولى" {...field} />
                    </FormControl>
                    {/* <FormMessage /> */}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وقت البدء (HH:mm)</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="08:00" {...field} />
                    </FormControl>
                    {/* <FormMessage /> */}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وقت الانتهاء (HH:mm)</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="08:45" {...field} />
                    </FormControl>
                    {/* <FormMessage /> */}
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-2">
                <Button type="submit" className="w-full">
                  {editingId ? "تحديث" : "إضافة"}
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelEdit}
                    className="w-full"
                  >
                    إلغاء
                  </Button>
                )}
              </div>
            </form>
          </Form>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">اسم الحصة</TableHead>
                  <TableHead className="text-right">وقت البدء</TableHead>
                  <TableHead className="text-right">وقت الانتهاء</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      جاري التحميل...
                    </TableCell>
                  </TableRow>
                ) : lessons.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground"
                    >
                      لا يوجد حصص مضافة حالياً
                    </TableCell>
                  </TableRow>
                ) : (
                  lessons.map((lesson) => (
                    <TableRow key={lesson.lessonId}>
                      <TableCell className="font-medium text-right">
                        {lesson.name}
                      </TableCell>
                      <TableCell className="text-right">
                        {lesson.start}
                      </TableCell>
                      <TableCell className="text-right">{lesson.end}</TableCell>
                      <TableCell className="text-right space-x-2 space-x-reverse">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(lesson)}
                          title="تعديل"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => onDelete(lesson.lessonId)}
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <ResultDialog
          open={resultState.open}
          onOpenChange={(open) => setResultState((prev) => ({ ...prev, open }))}
          title={resultState.title}
          message={resultState.message}
          variant={resultState.variant}
        />
      </DialogContent>
    </Dialog>
  );
}
