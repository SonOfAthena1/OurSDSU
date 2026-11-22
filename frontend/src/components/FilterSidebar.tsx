import Form from "react-bootstrap/Form";
import { useCourseContext } from "../hooks/useCourseContext";

function FilterSidebar() {
  const { geCategories, selectedGECategoryIds, setSelectedGECategoryIds } =
    useCourseContext();

  function toggleGECategory(geCategoryId: number) {
    setSelectedGECategoryIds((previousIds) =>
      previousIds.includes(geCategoryId)
        ? previousIds.filter((id) => id !== geCategoryId)
        : [...previousIds, geCategoryId],
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
              label={geCategory.ge_category}
            />
          ))}
        </div>
      </Form>
    </aside>
  );
}

export default FilterSidebar;
