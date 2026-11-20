export type SearchFilters = {
  subject?: string | null;
  courseNumber?: number | null;
  geCategories?: number[] | null;
  earlyStartTime?: string | null;
  laterStartTime?: string | null;
  days?: number | null;
  units?: number[] | null;
  location?: "online" | "in_person" | null;
  onlyOpenClasses?: boolean | null;
};