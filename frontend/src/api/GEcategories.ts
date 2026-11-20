import type { GEcategory } from "../types/geCategory";

type GEcategoriesResponse = {
  results: GEcategory[];
};

export async function getGEcategories(): Promise<GEcategory[]> {
  const response = await fetch(`http://localhost:8000/ge_categories`);

  if (!response.ok) {
    throw new Error("Could not load courses");
  }

  const data: GEcategoriesResponse = await response.json();

  return data.results;
}
