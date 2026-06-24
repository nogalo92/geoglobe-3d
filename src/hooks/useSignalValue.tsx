import type { Signal } from "@preact/signals-react";
import { useEffect, useState } from "react";

export function useSignalValue<T>(signal: Signal<T>): T {
  const [value, setValue] = useState(signal.value);

  useEffect(() => {
    return signal.subscribe(setValue);
  }, [signal]);

  return value;
}
