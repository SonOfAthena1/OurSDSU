import type { Semester } from "../types/semester";

type SemestersResponse = {
  results: Semester[];
};

export async function getSemesters(): Promise<Semester[]> {
  const response = await fetch(`http://localhost:8000/semesters`);

  if (!response.ok) {
    throw new Error("Could not load courses");
  }

  const data: SemestersResponse = await response.json();

  return data.results;
}
