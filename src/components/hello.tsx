"use client";
import React from "react";
import { useCore } from "../context/CoreProvider";

export const Hello: React.FC = () => {
  const { cart, isCartLoading } = useCore();

  return <div>{isCartLoading ? "Loading..." : "Core Working ✅"}</div>;
};
