"use client";

import { useEffect, useState } from "react";
import { loadCube, loadMuni } from "./data";
import type { Cube, Muni } from "./types";

function useLoaded<T>(load: () => Promise<T>): T | null {
  const [value, setValue] = useState<T | null>(null);
  useEffect(() => {
    let vivo = true;
    load().then((v) => vivo && setValue(v));
    return () => {
      vivo = false;
    };
  }, [load]);
  return value;
}

export const useCube = (): Cube | null => useLoaded(loadCube);
export const useMuni = (): Muni | null => useLoaded(loadMuni);
