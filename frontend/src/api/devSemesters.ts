import type { Semester } from "../types/semester";

const sampleResponse: { results: Semester[] } = {
  results: [
    { semester_id: 3, semester_name: "Spring", year: 2027 },
    { semester_id: 2, semester_name: "Winter", year: 2027 },
    { semester_id: 1, semester_name: "Fall", year: 2026 },
  ],
};

export async function getSemesters() {
  return sampleResponse.results;
}
