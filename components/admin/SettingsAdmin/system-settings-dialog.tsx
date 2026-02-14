"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminService, SystemSettings } from "@/features/admin";
import { Settings, Save, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SystemSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SystemSettingsDialog({
  open,
  onOpenChange,
}: SystemSettingsDialogProps) {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [initialSettings, setInitialSettings] = useState<SystemSettings | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (open) {
      loadSettings();
    }
  }, [open]);

  const loadSettings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.getSystemSettings();
      setSettings(data);
      setInitialSettings(data);
    } catch (err) {
      setError("فشل في تحميل الإعدادات");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setShowConfirmDialog(true);
  };

  const confirmSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    setError(null);
    setSuccess(false);
    setShowConfirmDialog(false);
    try {
      await adminService.updateSystemSettings(settings);
      setInitialSettings(settings);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onOpenChange(false);
      }, 1500);
    } catch (err) {
      setError("فشل في حفظ الإعدادات");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof SystemSettings, value: string) => {
    if (!settings) return;
    // Allow empty string so user can delete the value and type a new one
    if (value === "") {
      setSettings({ ...settings, [field]: 0 });
      return;
    }
    const numValue = parseFloat(value);
    setSettings({ ...settings, [field]: numValue });
  };

  const isDirty =
    settings && initialSettings
      ? JSON.stringify(settings) !== JSON.stringify(initialSettings)
      : false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            اعدادات النظام
          </DialogTitle>
          <DialogDescription className="text-right">
            تعديل معايير النظام العامة للغياب والتحذيرات
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : settings ? (
          <div className="grid gap-6 py-4">
            {error && (
              <Alert variant="destructive" className="text-right">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="studyWeeks"
                  className="text-right block font-bold"
                >
                  1- عدد اسابيع الدوام
                </Label>
                <Input
                  id="studyWeeks"
                  type="number"
                  step="any"
                  value={settings.numberOfWeeks}
                  onChange={(e) => updateField("numberOfWeeks", e.target.value)}
                  className="text-right"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="perc2"
                    className="text-right block text-xs font-bold"
                  >
                    2- النسبة الأقصى للغياب (2 ساعة)
                  </Label>
                  <div className="relative">
                    <Input
                      id="perc2"
                      type="number"
                      step="any"
                      value={settings.percent2Hour}
                      onChange={(e) =>
                        updateField("percent2Hour", e.target.value)
                      }
                      className="text-right pr-8"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      %
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="perc3"
                    className="text-right block text-xs font-bold"
                  >
                    3- النسبة الأقصى للغياب (3 ساعات)
                  </Label>
                  <div className="relative">
                    <Input
                      id="perc3"
                      type="number"
                      step="any"
                      value={settings.percent3Hour}
                      onChange={(e) =>
                        updateField("percent3Hour", e.target.value)
                      }
                      className="text-right pr-8"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      %
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="perc4"
                    className="text-right block text-xs font-bold"
                  >
                    4- النسبة الأقصى للغياب (4 ساعات)
                  </Label>
                  <div className="relative">
                    <Input
                      id="perc4"
                      type="number"
                      step="any"
                      value={settings.percent4Hour}
                      onChange={(e) =>
                        updateField("percent4Hour", e.target.value)
                      }
                      className="text-right pr-8"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      %
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="perc5"
                    className="text-right block text-xs font-bold"
                  >
                    5- النسبة الأقصى للغياب (5 ساعات)
                  </Label>
                  <div className="relative">
                    <Input
                      id="perc5"
                      type="number"
                      step="any"
                      value={settings.percent5Hour}
                      onChange={(e) =>
                        updateField("percent5Hour", e.target.value)
                      }
                      className="text-right pr-8"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      %
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100">
                <Label
                  htmlFor="warning2"
                  className="text-right block font-bold"
                >
                  6- عدد الغيابات بعد الانذار الأول (الإنذار الثاني)
                </Label>
                <Input
                  id="warning2"
                  type="number"
                  step="any"
                  value={settings.secondWarningThreshold}
                  onChange={(e) =>
                    updateField("secondWarningThreshold", e.target.value)
                  }
                  className="text-right"
                />
              </div>
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <Label
                  htmlFor="warning2"
                  className="text-right block font-bold"
                >
                  7- عدد الغيابات بعد الإنذار الثاني (الحرمان)
                </Label>
                <Input
                  id="warning2"
                  type="number"
                  step="any"
                  value={settings.deprivationExtraAfterSecond}
                  onChange={(e) =>
                    updateField("deprivationExtraAfterSecond", e.target.value)
                  }
                  className="text-right"
                />
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter className="sm:justify-start gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            إلغاء
          </Button>
          <Button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 gap-2"
            onClick={handleSave}
            disabled={isSaving || !settings || !isDirty}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : success ? (
              "تم الحفظ"
            ) : (
              <>
                <Save className="h-4 w-4" />
                {isDirty ? "حفظ الاعدادات الجديدة" : "حفظ الاعدادات"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">
              تأكيد حفظ الإعدادات
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right text-base text-gray-700">
              سوف يتم تطبيق هذه الاعدادات على الغيابات بعد اليوم ولن يتم تغيير
              الانذرات السابقة
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel disabled={isSaving}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSave}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSaving}
            >
              موافق، حفظ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
