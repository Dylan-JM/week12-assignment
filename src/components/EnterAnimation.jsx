"use client";

import * as motion from "motion/react-client";

export default function TextAnimation({ children, id }) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 1.5,
        scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
      }}
      style={{ display: "inline-block" }}
    >
      {children}
    </motion.div>
  );
}
