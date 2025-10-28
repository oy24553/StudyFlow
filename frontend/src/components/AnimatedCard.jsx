import { motion } from 'framer-motion';

export default function AnimatedCard({ children, delay = 0 }) {
  return (
    <motion.div
      className="card"
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  );
}

