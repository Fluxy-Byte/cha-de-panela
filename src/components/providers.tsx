"use client";

import { useState } from "react";
import { Provider } from "react-redux";
import { SWRConfig } from "swr";
import { makeStore } from "@/lib/redux/store";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function Providers({ children }: { children: React.ReactNode }) {
  const [store] = useState(() => makeStore());

  return (
    <Provider store={store}>
      <SWRConfig value={{ fetcher }}>{children}</SWRConfig>
    </Provider>
  );
}
