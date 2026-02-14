export interface LessonResponse {
  lessonId: number;
  name: string;
  start: string;
  end: string;
  isActive: boolean;
}

export interface CreateLessonDto {
  name: string;
  start: string;
  end: string;
}

export interface WeekDayResponse {
  weekDayId: number;
  name: string;
}
