import Form from "react-bootstrap/Form";
import { useCourseContext } from "../hooks/useCourseContext";
import { formatDecimalHours } from "../utils/time";
import { Button } from "react-bootstrap";

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
    startAfter,
    setStartAfter,
    startBefore,
    setStartBefore,
  } = useCourseContext();

  function toggleDayMaskList(num: number) {
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
      <h2 id="filters-heading" className="h2">
        Filters
      </h2>

      <h5>GE Categories:</h5>
      <Form className="mb-3">
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
      <Form className="mb-3">
        <div>
          {Object.entries(dayMap).map(([day, num]) => (
            <Form.Check
              key={num}
              id={`day-${num}`}
              type="checkbox"
              checked={dayMaskList.includes(num)}
              onChange={() => toggleDayMaskList(num)}
              label={day}
            />
          ))}
        </div>
      </Form>

      <h5>Times:</h5>
      <div className="mb-3">
        <>
          <Form.Label>
            Start After: {formatDecimalHours(startAfter, false)}
          </Form.Label>
          <Form.Range
            min={5}
            max={23.5}
            step={0.5} // 0.5 to represent 30 minute intervals
            value={startAfter}
            onChange={(event) => {
              const nextStartAfter = Number(event.currentTarget.value);
              setStartAfter(Math.min(nextStartAfter, startBefore));
            }}
          />
        </>

        <>
          <Form.Label>
            Start Before: {formatDecimalHours(startBefore, false)}
          </Form.Label>
          <Form.Range
            min={5}
            max={23.5}
            step={0.5} // 0.5 to represent 30 minute intervals
            value={startBefore}
            onChange={(event) => {
              const nextStartBefore = Number(event.currentTarget.value);
              setStartBefore(Math.max(nextStartBefore, startAfter));
            }}
          />
        </>

        <Button
          type="button"
          variant="outline-primary"
          active={dayMaskList.includes(0)}
          aria-pressed={dayMaskList.includes(0)} // communciates state to screen readers
          onClick={() => toggleDayMaskList(0)}
        >
          Asynchronous Classes
        </Button>
      </div>
    </aside>
  );
}

export default FilterSidebar;
