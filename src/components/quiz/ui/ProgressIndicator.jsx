import React from "react";

export default function ProgressIndicator({ step }) {
  const steps = [
    { number: 1, label: "Preferences" },
    { number: 2, label: "Income" },
    { number: 3, label: "Details" },
  ];

  return (
    <div className="flex items-center justify-between mb-6">
      {steps.map((s, index) => (
        <React.Fragment key={s.number}>
          <div className="flex flex-col items-center">
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all
                ${
                  step >= s.number
                    ? "bg-[#E7B739] text-white"
                    : "bg-gray-200 text-gray-500"
                }
              `}
            >
              {step > s.number ? (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                s.number
              )}
            </div>
            <span
              className={`
                text-xs mt-1 font-medium
                ${step >= s.number ? "text-[#E7B739]" : "text-gray-400"}
              `}
            >
              {s.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className="flex-1 mx-2">
              <div className="h-1 bg-gray-200 rounded-full">
                <div
                  className="h-1 bg-[#E7B739] rounded-full transition-all duration-500"
                  style={{
                    width: step > s.number ? "100%" : "0%",
                  }}
                />
              </div>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
