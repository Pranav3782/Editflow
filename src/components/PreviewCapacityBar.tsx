import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface PreviewCapacityBarProps {
  percentage: number;
  isAnimating?: boolean;
}

const PreviewCapacityBar = ({ percentage, isAnimating = false }: PreviewCapacityBarProps) => {
  const getColor = () => {
    if (percentage >= 90) return 'bg-gradient-to-r from-rose-400 to-rose-500';
    if (percentage >= 70) return 'bg-gradient-to-r from-amber-400 to-amber-500';
    return 'bg-gradient-to-r from-emerald-400 to-emerald-500';
  };

  return (
    <div className="capacity-bar w-full bg-secondary/50 rounded-full overflow-hidden">
      <motion.div
        className={cn('h-full rounded-full', getColor())}
        initial={{ width: 0 }}
        animate={{ 
          width: `${Math.min(percentage, 100)}%`,
          opacity: isAnimating ? [1, 0.7, 1] : 1,
        }}
        transition={{
          width: { type: 'spring', stiffness: 100, damping: 20 },
          opacity: { duration: 0.5, repeat: isAnimating ? Infinity : 0 },
        }}
      />
    </div>
  );
};

export default PreviewCapacityBar;
