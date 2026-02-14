"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";
import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { checkAuthSession } from "@/features/auth";

function ReduxProviderContent({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(checkAuthSession());
  }, [dispatch]);

  return <>{children}</>;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ReduxProviderContent>{children}</ReduxProviderContent>
    </Provider>
  );
}
