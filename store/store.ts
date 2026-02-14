import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "@/features/auth";
import { adminReducer } from "@/features/admin";
import { specializationsReducer } from "@/features/specialization";
import { teacherReducer } from "@/features/teacher";
import { studentReducer } from "@/features/student";
import { alertReducer } from "@/features/alert";
import { injectStore } from "@/lib/api";

export const store = configureStore({
  reducer: {
    AuthSlice: authReducer,
    admin: adminReducer,
    specializations: specializationsReducer,
    teacher: teacherReducer,
    student: studentReducer,
    alert: alertReducer,
  },
});

injectStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
