export type FollowUpNote = {
  id: string;
  studentId: string;
  note: string;
  date: string;
  addedBy: string;
  status: "pending" | "in-progress" | "resolved";
};
