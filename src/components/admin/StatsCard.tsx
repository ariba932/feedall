import { IconType } from 'react-icons';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  name: string;
  value: number;
  icon: IconType;
  color: string;
  bgColor: string;
}

export default function StatsCard({
  name,
  value,
  icon: Icon,
  color,
  bgColor,
}: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={cn('p-3 rounded-lg', bgColor)}>
          <Icon className={cn('w-6 h-6', color)} />
        </div>
        <div className="ml-5">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {name}
          </p>
          <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
            {value.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
