import React from "react";
import "../index.css";

export const range = len => {
  const arr = [];
  for (let i = 0; i < len; i++) {
    arr.push(i);
  }
  return arr;
};

const newAssets = (name, interest, amount) => {
  return {
    name: "Asset " + name,
    interest: interest,
    amount: amount,
  }
};

export function convertArray(collect) {
  const arr = [];
  if (collect.length <= 0) {
    return arr;
  }
  for (let item of collect) {
    arr.push(item.amount)
  }

  return arr;
}

export function stringifyFormData(fd) {
  const data = {};
	for (let key of fd.keys()) {
  	data[key] = fd.get(key);
  }
  return JSON.stringify(data, null, 2);
}

export function makeData(len=1) {
  return range(len).map(d => {
    return {
      ...newAssets(len, 0, 2000)
      //children: range(len).map(newAssets)
    };
  });
}
