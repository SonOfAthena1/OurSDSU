import Form from "react-bootstrap/Form";
import { useCourseContext } from "../hooks/useCourseContext";

const dayMap: Record<string, number> = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 4,
  Thursday: 8,
  Friday: 16,
};

function FilterSidebar() {
  const {
    geCategories,
    selectedGECategoryIds,
    setSelectedGECategoryIds,
    dayMaskList,
    setDayMaskList,
  } = useCourseContext();

  function addToDayMaskList(num: number) {
    setDayMaskList(
      (prevDayNums) =>
        prevDayNums.includes(num)
          ? prevDayNums.filter((n) => n !== num) // keep every num except input (remove it)
          : [...prevDayNums, num], // Add it to the list
    );
  }

  function toggleGECategory(geCategoryId: number) {
    setSelectedGECategoryIds(
      (previousIds) =>
        previousIds.includes(geCategoryId)
          ? previousIds.filter((id) => id !== geCategoryId) // keep every ID except input (remove it)
          : [...previousIds, geCategoryId], // Add it to the list
    );
  }

  return (
    <aside className="py-3" aria-labelledby="filters-heading">
      <h2 id="filters-heading" className="h5">
        Filters
      </h2>

      <p className="small text-body-secondary mb-0">
        More filter controls will go here.
      </p>
      <Form>
        <div>
          {geCategories.map((geCategory) => (
            <Form.Check
              key={geCategory.ge_category_id}
              id={`ge-category-${geCategory.ge_category_id}`}
              type="checkbox"
              checked={selectedGECategoryIds.includes(
                geCategory.ge_category_id,
              )}
              onChange={() => toggleGECategory(geCategory.ge_category_id)}
              label={`${geCategory.ge_category_code} — ${geCategory.ge_category}`}
            />
          ))}
        </div>
      </Form>
      <h5>Classes on Days:</h5>
      <Form>
        <div>
          {Object.entries(dayMap).map(([day, num]) => (
            <Form.Check
              key={num}
              id={`day-${num}`}
              type="checkbox"
              checked={dayMaskList.includes(num)}
              onChange={() => addToDayMaskList(num)}
              label={`${day}`}
            />
          ))}
        </div>
      </Form>
    </aside>
  );
}

export default FilterSidebar;
