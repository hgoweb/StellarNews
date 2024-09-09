import { motion } from 'framer-motion';

type LoaderProps = {
  padding: string;
};

function Loader({ padding }: LoaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      transition={{ duration: 0.5 }}
      style={{
        padding: padding,
      }}
    >
      <motion.div
        style={{
          width: 50,
          height: 50,
          borderRadius: '50%',
          border: '5px solid transparent',
          borderTop: '5px solid #3498db',
          margin: 'auto',
          boxSizing: 'border-box',
        }}
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 1,
          ease: 'linear',
        }}
      />
    </motion.div>
  );
}

export default Loader;
