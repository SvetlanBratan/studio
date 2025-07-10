'use client';

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface StatBarProps {
  label: string;
  value: number;
  maxValue: number;
  colorClass: string;
  icon: React.ReactNode;
}

export default function StatBar({ label, value, maxValue, colorClass, icon }: StatBarProps) {
  const percentage = (value / maxValue) * 100;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center text-sm font-medium">
        <div className="flex items-center gap-2">
          {icon}
          <span>{label}</span>
        </div>
        <span>
          {value} / {maxValue}
        </span>
      </div>
      <Progress value={percentage} className="h-3 [&>*]:transition-all [&>*]:duration-500" indicatorClassName={cn('rounded-full', colorClass)} />
    </div>
  );
}
