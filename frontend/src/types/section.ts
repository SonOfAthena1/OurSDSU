export type Section = {
  section_id: number;
  semester_id: number,
  semester_name: string;
  year: number;
  instructor_name: string;
  meeting_days: string[];
  start_time: string | null;
  end_time: string | null;
  class_location: string;
  max_enrollment: number;
  waitlist_size: number;
};