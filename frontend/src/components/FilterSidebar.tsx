import Form from "react-bootstrap/Form";
import { useCourseContext } from "../hooks/useCourseContext";

function FilterSidebar() {
  const { geCategories, selectedGECategoryIds, setSelectedGECategoryIds } =
    useCourseContext();

    /**
     * Changes current state of checkbox
     * if gecategory id is in array, removes it
     * else, adds it to array
     * @param GECategoryId 
     *
     */
  function toggleGECategory(GECategoryId: number) {
    setSelectedGECategoryIds(
      (previousIds) =>
        previousIds.includes(GECategoryId)
          ? previousIds.filter((id) => id !== GECategoryId) // remove it
          : [...previousIds, GECategoryId], // add it
    );
    console.log(selectedGECategoryIds)
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
          {geCategories.map((geCategories) => (
            <Form.Check
              key={geCategories.ge_category_id}
              type="checkbox"

              aria-pressed={selectedGECategoryIds.includes(
                geCategories.ge_category_id,
              )} // communciates state to screen readers
              onClick={() => toggleGECategory(geCategories.ge_category_id)}

              label={`${geCategories.ge_category}`}
            />
          ))}
        </div>
      </Form>
    </aside>
  );
}

export default FilterSidebar;
