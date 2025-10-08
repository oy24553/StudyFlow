import { motion } from 'framer-motion';
import useRipple from '../hooks/useRipple';

export default function PrimaryButton({ children, className = '', ...props }) {
  const ref = useRipple();
  return (
    <motion.button
      ref={ref}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={`btn btn-primary ripple ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
