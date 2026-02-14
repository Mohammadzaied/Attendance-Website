"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ServerCrash, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  const router = useRouter();

  useEffect(() => {
    // const navEntries = performance.getEntriesByType(
    //   "navigation",
    // ) as PerformanceNavigationTiming[];
    // if (navEntries.length > 0 && navEntries[0].type === "reload") {
    //   router.back();
    // }
  }, [router]);

  const handleRetry = () => {
    router.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center  from-gray-50 to-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center gap-4">
          <div className="h-20 w-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center animate-pulse">
            <ServerCrash className="h-10 w-10" />
          </div>
          <div className="h-20 w-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center animate-pulse">
            <WifiOff className="h-10 w-10" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">خطأ في الاتصال</h1>
          <p className="text-gray-600">عذراً، لا يمكن الوصول إلى الخادم</p>
        </div>

        {/* Description */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <p className="text-sm text-gray-700 text-right">قد يكون السبب:</p>
          <ul className="text-sm text-gray-600 space-y-1 text-right list-disc list-inside">
            <li>انقطاع الاتصال بالإنترنت</li>
            <li>الخادم متوقف مؤقتاً</li>
            <li>مشكلة في الشبكة</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={handleRetry}
            className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            إعادة المحاولة
          </Button>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-400">
          إذا استمرت المشكلة، يرجى التواصل مع الدعم الفني
        </p>
      </div>
    </div>
  );
}
