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
    name: "Investment 1",
    interest: 0,
    amount: 2000,
  }
};

export function stringifyFormData(fd) {
  const data = {};
	for (let key of fd.keys()) {
  	data[key] = fd.get(key);
  }
  return JSON.stringify(data, null, 2);
}

export function makeData(len=2) {
  return range(len).map(d => {
    return {
      ...newAssets()
      //children: range(len).map(newAssets)
    };
  });
}
