// code calling the backend goes here
import type { Course } from "../types/course";
import type { SearchFilters } from "../types/SearchFilters";

type CoursesResponse = {
  results: Course[];
};

// TODO: Learn how to expand this a lot more with Codex
/**
 * TODO add docu here
 * @param subject
 * @param courseNumber
 * @returns
 */
export async function getCourses(
  semesterId: number,
  filters: SearchFilters = {},
): Promise<Course[]> {
  const params = new URLSearchParams({ semester_id: String(semesterId) });

  const subject = filters.subject?.trim();
  if (subject) {
    params.set("subject_code", subject);
  }
  if (filters.courseNumber != null) {
    params.set("course_number", String(filters.courseNumber));
  }
  for (const categoryId of filters.geCategories ?? []) {
    params.append("ge_category_id", String(categoryId));
  }
  if (filters.earlyStartTime) {
    params.set("early_start_time", filters.earlyStartTime);
  }
  if (filters.laterStartTime) {
    params.set("late_start_time", filters.laterStartTime);
  }
  if (filters.days != null) {
    params.set("days", String(filters.days));
  }
  for (const unitNum of filters.units ?? []) {
    params.append("units", String(unitNum));
  }
  if (filters.location) {
    params.set("location", filters.location);
  }
  if (filters.onlyOpenClasses) {
    params.set("only_open_classes", "true");
  }

  console.log(params.toString());

  const response = await fetch(`http://localhost:8000/courses?${params}`);

  if (!response.ok) {
    throw new Error("Could not load courses");
  }

  const data: CoursesResponse = await response.json();

  return data.results;
}
