import type { Semester } from "../types/semester";

const sampleResponse: { results: Semester[] } = {
  results: [
    { semester_id: 8, semester_name: "Spring", year: 2027 },
    { semester_id: 7, semester_name: "Fall", year: 2026 },
  ],
};

export async function getSemesters() {
  return sampleResponse.results;
}
