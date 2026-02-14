"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type Warning } from "@/lib/mock-data";
import { SeverityBadge } from "@/components/shared/severity-badge";

type WarningsListProps = {
  warnings: Warning[];
  onMarkRead: (id: string) => void;
};

export function WarningsList({ warnings, onMarkRead }: WarningsListProps) {
  if (warnings.length === 0) return null;

  return (
    <Card className="shadow-sm border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-xl text-red-900 flex items-center gap-2">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          إنذارات جديدة ({warnings.length})
        </CardTitle>
        <CardDescription className="text-right text-red-800">
          إنذارات تم إرسالها من المعلمين للطلاب
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {warnings.map((warning) => (
            <div
              key={warning.id}
              className="border border-red-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="space-y-1">
                  <h4 className="font-semibold text-gray-900">{warning.studentName}</h4>
                  <p className="text-sm text-gray-600">
                    {warning.studentNumber} - {warning.section}
                  </p>
                </div>
                <SeverityBadge severity={warning.severity} />
              </div>
              <p className="text-gray-700 mb-3 leading-relaxed bg-gray-50 p-3 rounded">
                {warning.warningText}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{warning.date}</span>
                  <span>•</span>
                  <span>من: {warning.sentBy}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onMarkRead(warning.id)}
                  className="text-xs"
                >
                  تم الاطلاع
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
