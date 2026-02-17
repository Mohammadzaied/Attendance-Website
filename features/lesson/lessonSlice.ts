import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { lessonService } from "./lessonService";
import { LessonResponse } from "./lessonTypes";

interface LessonState {
  lessons: LessonResponse[];
  isLoading: boolean;
  error: string | null;
}

const initialState: LessonState = {
  lessons: [],
  isLoading: false,
  error: null,
};

export const fetchLessons = createAsyncThunk(
  "lesson/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await lessonService.getAllLessons();
    } catch (error: any) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch lessons");
    }
  },
);

const lessonSlice = createSlice({
  name: "lesson",
  initialState,
  reducers: {
    clearLessonError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLessons.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchLessons.fulfilled,
        (state, action: PayloadAction<LessonResponse[]>) => {
          state.isLoading = false;
          state.lessons = action.payload;
          state.error = null;
        },
      )
      .addCase(fetchLessons.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearLessonError } = lessonSlice.actions;
export default lessonSlice.reducer;
