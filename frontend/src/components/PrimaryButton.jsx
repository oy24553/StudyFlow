import { motion as Motion } from 'framer-motion';
import useRipple from '../hooks/useRipple';

export default function PrimaryButton({ children, className = '', ...props }) {
  const ref = useRipple();
  return (
    <Motion.button
      ref={ref}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={`btn btn-primary ripple ${className}`}
      {...props}
    >
      {children}
    </Motion.button>
  );
}
