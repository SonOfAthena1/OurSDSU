import type { Semester } from "../types/semester";

const sampleResponse: { results: Semester[] } = {
  results: [
    { semester_id: 1, semester_name: "Fall", year: 2026 },
    { semester_id: 3, semester_name: "Spring", year: 2027 },
  ],
};

export async function getSemesters() {
  return sampleResponse.results;
}
