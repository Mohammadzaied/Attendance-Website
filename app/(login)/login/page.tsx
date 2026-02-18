"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  signIn,
  clearError,
  forgotPassword,
  verifyResetCode,
  resetPassword,
} from "@/features/auth/authSlice";
import { toast } from "sonner";
import { Loader2, ArrowRight } from "lucide-react";

type AuthStep = "login" | "forgot-password" | "verify-code" | "reset-password";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const {
    signInState,
    forgotPasswordState,
    verifyResetCodeState,
    resetPasswordState,
  } = useAppSelector((state) => state.AuthSlice);

  const [step, setStep] = useState<AuthStep>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    try {
      await dispatch(
        signIn({
          username: email,
          password,
        }),
      ).unwrap();
    } catch (err: any) {
      // Error handled by Redux
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    try {
      await dispatch(forgotPassword({ email })).unwrap();
      toast.success("تم إرسال رمز التحقق إلى بريدك الإلكتروني");
      setStep("verify-code");
    } catch (err: any) {
      // Error handled by Redux
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    try {
      await dispatch(verifyResetCode({ email, code: resetCode })).unwrap();
      toast.success("تم التحقق من الرمز بنجاح");
      setStep("reset-password");
    } catch (err: any) {
      // Error handled by Redux
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("كلمات المرور غير متطابقة");
      return;
    }
    dispatch(clearError());
    try {
      await dispatch(
        resetPassword({
          email,
          code: resetCode,
          newPassword,
          confirmPassword,
        }),
      ).unwrap();
      toast.success(
        "تم إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.",
      );
      setStep("login");
    } catch (err: any) {
      // Error handled by Redux
    }
  };

  const renderTitle = () => {
    switch (step) {
      case "forgot-password":
        return "نسيت كلمة المرور؟";
      case "verify-code":
        return "التحقق من الرمز";
      case "reset-password":
        return "إعادة تعيين كلمة المرور";
      default:
        return "كلية مجتمع المرأة برام الله - الطيرة";
    }
  };

  const getCurrentState = () => {
    switch (step) {
      case "forgot-password":
        return forgotPasswordState;
      case "verify-code":
        return verifyResetCodeState;
      case "reset-password":
        return resetPasswordState;
      default:
        return signInState;
    }
  };

  const { isLoading, error } = getCurrentState();

  const handleGoBack = () => {
    dispatch(clearError());
    setStep("login");
  };

  return (
    <div className="h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-indigo-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mb-4 flex justify-center">
            <img
              src="/rwtc_hdr.gif"
              alt="كلية مجتمع المرأة برام الله - الطيرة"
              title="كلية مجتمع المرأة برام الله - الطيرة"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {renderTitle()}
          </CardTitle>
          {step !== "login" && (
            <button
              onClick={handleGoBack}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center justify-center gap-1 transition-colors mx-auto cursor-pointer"
            >
              <ArrowRight className="h-4 w-4" />
              العودة لتسجيل الدخول
            </button>
          )}
        </CardHeader>
        <CardContent className="pt-8">
          {step === "login" && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-right block text-md">
                  البريد الإلكتروني
                </Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="اسم المستخدم"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label
                    htmlFor="password"
                    className="text-right block text-sm font-bold text-gray-700"
                  >
                    كلمة المرور
                  </Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    dispatch(clearError());
                    setStep("forgot-password");
                  }}
                  className="text-xs text-blue-600 hover:underline font-medium cursor-pointer"
                >
                  نسيت كلمة المرور؟
                </button>
              </div>

              {error && (
                <div className="p-4 text-sm text-red-600 bg-red-50/50 border border-red-100 rounded-xl text-right font-medium animate-in slide-in-from-top-2">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 cursor-pointer bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جاري التحميل...
                  </div>
                ) : (
                  "تسجيل الدخول"
                )}
              </Button>
            </form>
          )}

          {step === "forgot-password" && (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <p className="text-center text-gray-500 text-sm leading-relaxed">
                أدخل بريدك الإلكتروني وسنرسل لك رمزاً لإعادة تعيين كلمة المرور
              </p>
              <div className="space-y-2">
                <Label
                  htmlFor="email-forgot"
                  className="text-right block text-sm font-bold text-gray-700"
                >
                  البريد الإلكتروني
                </Label>
                <Input
                  id="email-forgot"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 text-right"
                  required
                />
              </div>

              {error && (
                <div className="p-4 text-sm text-red-600 bg-red-50/50 border border-red-100 rounded-xl text-right font-medium animate-in slide-in-from-top-2">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl active:scale-[0.98] transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "إرسال الرمز"
                )}
              </Button>
            </form>
          )}

          {step === "verify-code" && (
            <form onSubmit={handleVerifyCode} className="space-y-5">
              <p className="text-center text-gray-500 text-sm leading-relaxed">
                تم إرسال رمز التحقق إلى{" "}
                <span className="font-bold text-blue-600">{email}</span>. يرجى
                إدخاله أدناه.
              </p>
              <div className="space-y-2">
                <Label
                  htmlFor="code"
                  className="text-right block text-sm font-bold text-gray-700"
                >
                  رمز التحقق
                </Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  className="h-12 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 text-center text-2xl font-mono tracking-widest"
                  required
                />
              </div>

              {error && (
                <div className="p-4 text-sm text-red-600 bg-red-50/50 border border-red-100 rounded-xl text-right font-medium animate-in slide-in-from-top-2">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl active:scale-[0.98] transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "تحقق من الرمز"
                )}
              </Button>
            </form>
          )}

          {step === "reset-password" && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="new-password"
                  className="text-right block text-sm font-bold text-gray-700"
                >
                  كلمة المرور الجديدة
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="كلمة المرور الجديدة"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-12 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 text-right font-sans"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirm-password"
                  className="text-right block text-sm font-bold text-gray-700"
                >
                  تأكيد كلمة المرور
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="تأكيد كلمة المرور"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 text-right font-sans"
                  required
                />
              </div>

              {error && (
                <div className="p-4 text-sm text-red-600 bg-red-50/50 border border-red-100 rounded-xl text-right font-medium animate-in slide-in-from-top-2">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl active:scale-[0.98] transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "حفظ كلمة المرور الجديدة"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
