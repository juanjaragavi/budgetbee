import React from "react";
import { motion } from "framer-motion";

export default function OptionButton({
  id,
  label,
  selected,
  onClick,
  delay = 0,
  className = "",
}) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      type="button"
      onClick={onClick}
      className={`
        w-full p-4 text-left rounded-lg border-2 transition-all
        ${
          selected
            ? "border-[#E7B739] bg-[#E7B739] bg-opacity-10"
            : "border-gray-200 hover:border-[#E7B739] hover:bg-gray-50"
        }
        ${className}
      `}
    >
      <div className="flex items-center justify-between">
        <span className="text-gray-800 font-medium">{label}</span>
        <div
          className={`
            w-5 h-5 rounded-full border-2 transition-all
            ${selected ? "border-[#E7B739] bg-[#E7B739]" : "border-gray-300"}
          `}
        >
          {selected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-full h-full flex items-center justify-center"
            >
              <svg
                className="w-3 h-3 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.div>
          )}
        </div>
      </div>
    </motion.button>
  );
}
