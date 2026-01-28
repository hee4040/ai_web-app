"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SortDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function SortDropdown({ value, onValueChange }: SortDropdownProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[160px] border-border bg-card text-card-foreground">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent className="border-border bg-popover">
        <SelectItem value="latest">Latest first</SelectItem>
        <SelectItem value="oldest">Oldest first</SelectItem>
        <SelectItem value="name">Name A-Z</SelectItem>
      </SelectContent>
    </Select>
  );
}
