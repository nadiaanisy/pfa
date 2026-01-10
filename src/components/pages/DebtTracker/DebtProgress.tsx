import { motion } from 'motion/react';

export const DebtProgress = ({ percentage, gradient }: any) => (
  <div className="relative w-full h-3 bg-soft-gray rounded-full overflow-hidden">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${percentage}%` }}
      transition={{ duration: 0.5 }}
      className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-500"
    />
  </div>
);
