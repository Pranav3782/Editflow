import { cn } from '@/lib/utils';

interface CapacityBarProps {
  percentage: number;
  showHeatmap?: boolean;
}

const CapacityBar = ({ percentage, showHeatmap = false }: CapacityBarProps) => {
  const getColor = () => {
    if (percentage >= 90) return 'bg-danger';
    if (percentage >= 70) return 'bg-warning';
    return 'bg-success';
  };

  return (
    <div className="capacity-bar w-full">
      <div
        className={cn('capacity-fill', getColor())}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  );
};

export default CapacityBar;
