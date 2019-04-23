import React from "react";
import "../index.css";

const range = len => {
  const arr = [];
  for (let i = 0; i < len; i++) {
    arr.push(i);
  }
  return arr;
};

const newAssets = () => {
  return {
    name: "Chequing",
    interest: 0,
    amount: 2000,
  };
};

export function makeData(len=2) {
  return range(len).map(d => {
    return {
      ...newAssets(),
      children: range(2).map(newAssets)
    };
  });
}
