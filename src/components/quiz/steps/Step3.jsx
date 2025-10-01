import React, { useState } from "react";
import { motion } from "framer-motion";
import ProgressIndicator from "../ui/ProgressIndicator";

export default function Step3({ formData, updateFormData, onSubmit }) {
  const [email, setEmail] = useState(formData.email);
  const [name, setName] = useState(formData.name);
  const [receiveMessages, setReceiveMessages] = useState(
    formData.receiveMessages,
  );
  const [errors, setErrors] = useState({
    email: null,
    name: null,
    general: null,
  });

  const validateEmail = (email) => {
    if (!email) {
      setErrors((prev) => ({
        ...prev,
        email: "Email address is required",
      }));
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors((prev) => ({
        ...prev,
        email: "Please enter a valid email address",
      }));
      return false;
    }

    const domainPart = email.split("@")[1]?.toLowerCase();
    if (domainPart) {
      if (domainPart.split(".").length < 2 || domainPart.endsWith(".")) {
        setErrors((prev) => ({
          ...prev,
          email: "The email domain appears incomplete",
        }));
        return false;
      }
    }

    setErrors((prev) => ({ ...prev, email: null }));
    return true;
  };

  const validateName = (name) => {
    if (!name.trim()) {
      setErrors((prev) => ({
        ...prev,
        name: "First name is required",
      }));
      return false;
    }

    if (name.trim().length < 2) {
      setErrors((prev) => ({
        ...prev,
        name: "First name must be at least 2 characters",
      }));
      return false;
    }

    setErrors((prev) => ({ ...prev, name: null }));
    return true;
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    updateFormData({ email: value });
    if (value.length > 5) {
      validateEmail(value);
    }
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    updateFormData({ name: value });
    if (value.length > 0) {
      validateName(value);
    }
  };

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setReceiveMessages(checked);
    updateFormData({ receiveMessages: checked });
  };

  const validateForm = () => {
    const isEmailValid = validateEmail(email);
    const isNameValid = validateName(name);

    if (!receiveMessages) {
      setErrors((prev) => ({
        ...prev,
        general: "You must agree to the terms to continue",
      }));
      return false;
    } else {
      setErrors((prev) => ({ ...prev, general: null }));
    }

    return isEmailValid && isNameValid && receiveMessages;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit();
    }
  };

  return (
    <div className="space-y-4">
      <ProgressIndicator step={3} />
      <div className="text-left mb-4">
        <h2 className="text-xl font-bold text-left text-gray-950">
          Excellent!
        </h2>
        <p className="text-xl leading-tight font-bold text-left text-[#E7B739]">
          Enter your details and instantly access the credit card that's{" "}
          <span className="text-[#4A90E2]">perfect for you</span>
        </p>
      </div>

      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            onBlur={() => validateEmail(email)}
            required
            className={`w-full h-9 px-3 text-base rounded-md border ${
              errors.email
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-[#E7B739] focus:ring-[#E7B739]"
            } focus:outline-none focus:ring-2`}
            placeholder="your@email.com"
            aria-describedby="email-error"
          />
          {errors.email && (
            <p id="email-error" className="text-xs text-red-500 mt-1">
              {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium">
            First Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={handleNameChange}
            onBlur={() => validateName(name)}
            required
            className={`w-full h-9 px-3 text-base rounded-md border ${
              errors.name
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-[#E7B739] focus:ring-[#E7B739]"
            } focus:outline-none focus:ring-2`}
            placeholder="Your first name"
            aria-describedby="name-error"
          />
          {errors.name && (
            <p id="name-error" className="text-xs text-red-500 mt-1">
              {errors.name}
            </p>
          )}
        </div>

        <div className="flex items-start space-x-2">
          <input
            id="receiveMessages"
            type="checkbox"
            checked={receiveMessages}
            onChange={handleCheckboxChange}
            className="mt-0.5 h-4 w-4 text-[#E7B739] border-gray-300 rounded focus:ring-[#E7B739]"
          />
          <label htmlFor="receiveMessages" className="text-xs">
            I agree to receive personalized credit card recommendations and
            accept the{" "}
            <a href="/terms-conditions" className="underline text-[#E7B739]">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy-policy" className="underline text-[#E7B739]">
              Privacy Policy
            </a>
          </label>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6"
      >
        {errors.general && (
          <p className="text-xs text-red-500 mt-2 text-left">
            {errors.general}
          </p>
        )}

        <button
          type="button"
          onClick={handleFormSubmit}
          disabled={!receiveMessages}
          className={`w-full py-3 text-sm font-medium rounded-full transition-colors shadow-md ${
            receiveMessages
              ? "bg-[#7ED321] hover:bg-[#6BA828] text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          GET MY RECOMMENDATIONS
        </button>
      </motion.div>

      <div className="mt-8">
        <p className="text-left text-sm">
          <span className="font-bold text-[#E7B739]">Important:</span> Please
          ensure your email is correct so we can send you personalized
          recommendations
        </p>
        <p className="text-left text-xs mt-2 text-gray-500">
          © BudgetBee 2025. Your trusted financial companion.
        </p>
      </div>
    </div>
  );
}
