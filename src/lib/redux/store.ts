import { configureStore } from "@reduxjs/toolkit";
import envelopeReducer from "./features/envelope-slice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      envelope: envelopeReducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
