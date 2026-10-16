import type { Section } from "./section";

export type Course = {
  course_id: number;
  subject_code: string;
  course_number: number;
  course_name: string;
  course_description: string;
  units: number;
  sections: Section[];
};
