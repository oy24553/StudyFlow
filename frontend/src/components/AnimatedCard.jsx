import { motion as Motion } from 'framer-motion';

export default function AnimatedCard({ children, delay = 0, className = '', ...props }) {
  return (
    <Motion.div
      className={`card ${className}`.trim()}
      {...props}
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay }}
    >
      {children}
    </Motion.div>
  );
}
