import React from "react";

const Button = ({
  label,
  link,
  style,
  rel,
}: {
  label: string;
  link: string;
  style?: string;
  rel?: string;
}) => {
  return (
    <a
      href={link}
      rel={`noopener noreferrer ${
        rel ? (rel === "follow" ? "" : rel) : "nofollow"
      }`}
      className={`text-white btn mb-4 w-full text-center no-underline ${
        style === "outline" ? "btn-outline-primary" : "btn-primary"
      }`}
      style={{ backgroundColor: "var(--product-color)" }}
    >
      {label}
    </a>
  );
};

export default Button;
