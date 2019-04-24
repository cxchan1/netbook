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

const newDebts = (name, interest, monthly, amount) => {
  return {
    name: "Debt " + name,
    monthly: monthly,
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
    arr.push(Number(item.amount))
  }

  return arr;
}

export function convertAssets(array, old) {
  const newCollect = old;
  const arr = [];
  if (array.length <= 0) {
    return old;
  }
  var index = 0;
  for (let i of newCollect) {
    i.amount = array[index]
    arr.push(i);
    index++;
  }
  return arr;
}

export function convertDebts(debts, monthly, old) {
  const newCollect = old;
  const arr = [];
  if (debts.length <= 0 && monthly.length <= 0) {
    return old;
  }
  var index = 0;
  for (let i of newCollect) {
    i.monthly = monthly[index]
    i.amount = debts[index]
    arr.push(i);
    index++;
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

export function makeAsset(len=1) {
  return range(len).map(d => {
    return {
      ...newAssets(len, 0, 2000)
      //children: range(len).map(newAssets)
    };
  });
}

export function makeDebt(len=1) {
  return range(len).map(d => {
    return {
      ...newDebts(len, 50, 200, 42000)
      //children: range(len).map(newAssets)
    };
  });
}
