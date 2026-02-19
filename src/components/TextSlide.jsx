"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, Children } from "react";

export default function TextSlide({ children, interval = 5000 }) {
  const items = Children.toArray(children);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % items.length);
    }, interval);

    return () => clearInterval(timer);
  }, [items.length, interval]);

  return (
    <div
      style={{
        overflow: "hidden",
        position: "relative",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{ position: "relative" }}
        >
          {items[current]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
