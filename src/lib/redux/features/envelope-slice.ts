import { createSlice } from "@reduxjs/toolkit";

interface EnvelopeState {
  isOpen: boolean;
}

const initialState: EnvelopeState = {
  isOpen: false,
};

const envelopeSlice = createSlice({
  name: "envelope",
  initialState,
  reducers: {
    openEnvelope: (state) => {
      state.isOpen = true;
    },
    closeEnvelope: (state) => {
      state.isOpen = false;
    },
  },
});

export const { openEnvelope, closeEnvelope } = envelopeSlice.actions;
export default envelopeSlice.reducer;
