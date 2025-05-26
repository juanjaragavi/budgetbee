import React, { useState } from "react";
import { motion } from "framer-motion";
import OptionButton from "../ui/OptionButton";
import ProgressIndicator from "../ui/ProgressIndicator";

export default function Step1({ formData, updateFormData }) {
  const [selected, setSelected] = useState(formData.preference);

  const options = [
    { id: "A", label: "High credit limit" },
    { id: "B", label: "Instant approval" },
    { id: "C", label: "No credit check" },
    { id: "D", label: "No annual fee" },
    { id: "E", label: "Rewards and cashback" },
    { id: "F", label: "Travel benefits" },
  ];

  const handleSelect = (id) => {
    setSelected(id);
    updateFormData({ preference: id });
  };

  return (
    <div className="space-y-4">
      <ProgressIndicator step={1} />
      <div className="text-left">
        <h2 className="text-md font-bold text-left text-gray-950">
          Find Your Perfect Credit Card
        </h2>
      </div>

      <motion.h1
        className="text-xl leading-tight font-bold text-left text-[#E7B739]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        What's most important to you in a credit card?
      </motion.h1>

      <motion.div
        className="space-y-2 mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, staggerChildren: 0.1 }}
      >
        {options.map((option, index) => (
          <OptionButton
            key={option.id}
            id={option.id}
            label={option.label}
            selected={selected === option.id}
            onClick={() => handleSelect(option.id)}
            delay={0.1 * index}
            className="quiz-step-1"
          />
        ))}
      </motion.div>

      <div className="mt-10">
        <p className="text-left text-xs text-gray-500">
          © BudgetBee 2025. Your trusted financial companion.
        </p>
      </div>
    </div>
  );
}
