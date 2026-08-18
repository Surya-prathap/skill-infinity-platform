import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { emptyDraft, loadDraft, type MentorDraft } from '@/features/mentor/storage';

export interface MentorState {
  /** Zero-based index into WIZARD_STEPS. */
  step: number;
  draft: MentorDraft;
  submitted: boolean;
}

const initialState: MentorState = {
  step: 0,
  draft: loadDraft(),
  submitted: false,
};

const mentorSlice = createSlice({
  name: 'mentor',
  initialState,
  reducers: {
    setStep(state, action: PayloadAction<number>) {
      state.step = action.payload;
    },
    updateDraft(state, action: PayloadAction<Partial<MentorDraft>>) {
      state.draft = { ...state.draft, ...action.payload };
    },
    resetWizard(state) {
      state.step = 0;
      state.draft = emptyDraft();
      state.submitted = false;
    },
    markSubmitted(state) {
      state.submitted = true;
    },
  },
});

export const { setStep, updateDraft, resetWizard, markSubmitted } = mentorSlice.actions;

export default mentorSlice.reducer;
