import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Step1 from "./steps/Step1";
import Step2 from "./steps/Step2";
import Step3 from "./steps/Step3";

// Cookie names for user tracking
const COOKIE_NAMES = {
  QUIZ_COMPLETED: "quizCompleted",
  USER_REGISTERED: "userRegistered",
  USER_DATA: "userData",
};

export default function CreditCardForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    preference: "",
    preferenceText: "",
    income: "",
    incomeText: "",
    email: "",
    name: "",
    receiveMessages: false,
  });
  const [isRegisteredUser, setIsRegisteredUser] = useState(false);

  const totalSteps = 3;
  const progress = Math.round(((step - 1) / (totalSteps - 1)) * 100) || 0;

  const updateFormData = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const getPreferenceText = (id) => {
    const options = [
      { id: "A", label: "High credit limit" },
      { id: "B", label: "Instant approval" },
      { id: "C", label: "No credit check" },
      { id: "D", label: "No annual fee" },
      { id: "E", label: "Rewards and cashback" },
      { id: "F", label: "Travel benefits" },
    ];
    const option = options.find((opt) => opt.id === id);
    return option ? option.label : "";
  };

  const getIncomeText = (id) => {
    const options = [
      { id: "A", label: "Under $25,000" },
      { id: "B", label: "$25,000 - $50,000" },
      { id: "C", label: "$50,000 - $75,000" },
      { id: "D", label: "$75,000 - $100,000" },
      { id: "E", label: "$100,000 - $150,000" },
      { id: "F", label: "Over $150,000" },
    ];
    const option = options.find((opt) => opt.id === id);
    return option ? option.label : "";
  };

  // Check if user is registered based on cookies on component mount
  useEffect(() => {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
    };

    const userRegistered = getCookie(COOKIE_NAMES.USER_REGISTERED);
    const userData = getCookie(COOKIE_NAMES.USER_DATA);

    if (userRegistered === "true" && userData) {
      setIsRegisteredUser(true);

      try {
        const savedData = JSON.parse(decodeURIComponent(userData));
        if (savedData.email) {
          updateFormData({
            email: savedData.email,
            name: savedData.name || "",
            receiveMessages: true,
          });
        }
      } catch (error) {
        console.error("Error parsing saved user data:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (formData.preference) {
      updateFormData({
        preferenceText: getPreferenceText(formData.preference),
      });
    }
    if (formData.income) {
      updateFormData({ incomeText: getIncomeText(formData.income) });
    }
  }, [formData.preference, formData.income]);

  useEffect(() => {
    if (
      step < totalSteps &&
      ((step === 1 && formData.preference) || (step === 2 && formData.income))
    ) {
      // For registered users, skip step 3 after completing step 2
      if (step === 2 && formData.income && isRegisteredUser) {
        setTimeout(() => {
          handleSubmit();
        }, 500);
      } else {
        // Normal flow: proceed to next step
        const timer = setTimeout(() => setStep(step + 1), 500);
        return () => clearTimeout(timer);
      }
    }
  }, [formData, step, isRegisteredUser]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    console.log("Form submitted with data:", formData);

    const setCookie = (name, value, days) => {
      const expires = new Date();
      expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
      document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    };

    try {
      // Here you would send data to your API endpoint
      // For now, we'll just log it
      const quizData = {
        preference: formData.preferenceText || formData.preference,
        income: formData.incomeText || formData.income,
        email: formData.email,
        name: formData.name,
        acceptedTerms: formData.receiveMessages,
        timestamp: new Date().toISOString(),
        source: "BudgetBee Quiz",
      };

      console.log("Quiz data to be sent:", quizData);

      const response = await fetch("/api/quiz-submission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quizData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit quiz");
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
    } finally {
      // Set cookies to indicate quiz completion and user registration
      setCookie(COOKIE_NAMES.QUIZ_COMPLETED, "true", 30);

      // Save user registration status and data for future visits
      if (formData.email) {
        setCookie(COOKIE_NAMES.USER_REGISTERED, "true", 30);
        setCookie(
          COOKIE_NAMES.USER_DATA,
          encodeURIComponent(
            JSON.stringify({
              email: formData.email,
              name: formData.name,
            }),
          ),
          30,
        );
      }

      // Redirect to credit card recommender page
      window.location.href = "/credit-card-recommender-p1";
    }
  };

  return (
    <div className="bg-white flex flex-col min-h-screen">
      <div className="bg-[#E7B739] py-4 px-4 flex justify-center">
        <h1 className="text-2xl font-bold text-white">BudgetBee Quiz</h1>
      </div>

      <div className="relative flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="px-4 pt-10 pb-20"
          >
            <form onSubmit={(e) => step === totalSteps && handleSubmit(e)}>
              {step === 1 && (
                <Step1 formData={formData} updateFormData={updateFormData} />
              )}
              {step === 2 && (
                <Step2 formData={formData} updateFormData={updateFormData} />
              )}
              {step === 3 && (
                <Step3
                  formData={formData}
                  updateFormData={updateFormData}
                  onSubmit={handleSubmit}
                />
              )}
            </form>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-4 bg-white border-t ">
        <div className="w-full space-y-3 mt-2">
          <div className="space-y-2">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#7ED321] to-[#E7B739]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <div className="text-left text-sm text-gray-600">
              {progress}% complete
              {progress < 100 ? ", keep going!" : "!"}
              {isRegisteredUser && step === 2 && (
                <div className="text-xs text-[#E7B739] mt-1">
                  Welcome back! We'll use your saved information.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
