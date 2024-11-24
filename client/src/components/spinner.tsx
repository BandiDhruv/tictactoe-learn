import React from "react";

const Spinner: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={`animate-spin rounded-full border-4 border-solid border-blue-500 border-t-transparent ${className}`}
    ></div>
  );
};

export default Spinner;
