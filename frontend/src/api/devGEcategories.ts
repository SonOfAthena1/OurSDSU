import type { GEcategory } from "../types/geCategory";

const sampleResponse: { results: GEcategory[] } = {
  results: [
    {
      ge_category_id: 1,
      ge_category_code: "1a",
      ge_category: "American History",
    },
    { ge_category_id: 2, ge_category_code: "2b", ge_category: "Math" },
    { ge_category_id: 3, ge_category_code: "3c", ge_category: "Chemistry" },
    { ge_category_id: 4, ge_category_code: "4d", ge_category: "CS" },
  ],
};

export async function getGEcategories() {
  return sampleResponse.results;
}
