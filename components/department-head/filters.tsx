"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type FiltersProps = {
  departments: string[];
  department: string;
  onDepartmentChange: (value: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
};

export function Filters({
  departments,
  department,
  onDepartmentChange,
  searchQuery,
  onSearchChange,
}: FiltersProps) {
  return (
    <Card className="shadow-sm mb-8">
      <CardHeader>
        <CardTitle className="text-xl">البحث والتصفية</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="department" className="text-right block">
              القسم
            </Label>
            <Select value={department} onValueChange={onDepartmentChange}>
              <SelectTrigger id="department">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="search" className="text-right block">
              بحث
            </Label>
            <Input
              id="search"
              placeholder="ابحث بالاسم أو الرقم الجامعي..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="text-right"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
