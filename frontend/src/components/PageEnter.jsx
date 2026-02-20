import { motion as Motion } from 'framer-motion';

export default function PageEnter({ children }) {
  return (
    <Motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      {children}
    </Motion.div>
  );
}
