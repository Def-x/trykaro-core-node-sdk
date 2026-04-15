import React from "react";

export const DeleteIcon = ({
  onClick,
  className = "",
  title = "",
  disabled = false,
}) => (
  <svg
    onClick={onClick}
    disabled={disabled}
    className={className}
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    title={title}
  >
    <path
      d="M2.5 5h15M8.5 8.5v5M11.5 8.5v5M3 5.5v11c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-11M7 5V3.5c0-.3.2-.5.5-.5h5c.3 0 .5.2.5.5V5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const EditIcon = ({
  onClick,
  className = "",
  title = "",
  disabled = false,
}) => (
  <svg
    onClick={onClick}
    disabled={disabled}
    className={className}
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    title={title}
  >
    <path
      d="M2.5 17.5h3l11-11-3-3-11 11v3zm15.4-12.4c.4-.4.4-1 0-1.4l-2-2c-.4-.4-1-.4-1.4 0l-1.6 1.6 3 3 1.6-1.6z"
      fill="currentColor"
    />
  </svg>
);
