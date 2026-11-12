import { useCourseContext } from "../hooks/useCourseContext";
import CourseCard from "../components/CourseCard";
import { useState, type SubmitEvent } from "react";
import { Button } from "react-bootstrap";

function Home() {
  const {
  courses,
  semesters,
  geCategories,
  selectedSemesterIds,
  setSelectedSemesterIds,
} = useCourseContext();

  const [searchText, setSearchText] = useState("");
  const [searchError, setSearchError] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState<{
    subject: string;
    courseNumber: number;
  } | null>(null);

  /**
   * If a semesterId is in the current semesterIds array, removes
   * it from the array. If it's not in the array, adds it to the array.
   * @param semesterId the semester ID to add or remove
   */
  function toggleSemester(semesterId: number) {
    setSelectedSemesterIds((previousIds) =>
      previousIds.includes(semesterId)
        ? previousIds.filter((id) => id !== semesterId) // remove it
        : [...previousIds, semesterId], // add it
    );
  }

  /**
   * TODO
   * @param event
   * @returns
   */
  function handleSearch(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchError("");

    const query = searchText.trim();

    if (query === "") {
      setSearchError("Enter a course to search for.");
      return;
    }

    /**
     * match[0] = "cs 210" — the entire match  \
     * match[1] = "cs"     — first captured group  \
     * match[2] = "210"    — second captured group  \
     */
    const match = query.match(/^([a-z]+)\s*(\d+)$/i);
    /*
     * `^`       -> Start of the text
     * `([a-z]+)` -> One or more letters; remember them as group 1
     * `\s*`     -> Zero or more whitespace characters
     * `(\d+)`  -> One or more digits; remember them as group 2
     * `$`      -> End of the text
     * `i`      -> Accept uppercase and lowercase letters
     */

    if (match === null) {
      setSearchError("Enter a subject and course number, like CS 210.");
      return;
    }

    const subject = match[1].toUpperCase();
    const courseNumber = Number(match[2]);

    console.log({ subject, courseNumber });
    console.log(query);

    setSubmittedSearch({ subject, courseNumber });
  }

  return (
    <section className="container py-5">
      <h1>Welcome to OurSDSU</h1>
      <p>Find courses and explore your next semester.</p>

      <div>
        {semesters.map((semester) => (
          <Button 
            key={semester.semester_id} 
            type="button"
            variant="outline-primary"
            active={selectedSemesterIds.includes(semester.semester_id)}
            aria-pressed={selectedSemesterIds.includes(semester.semester_id)} // communciates state to screen readers
            onClick={() => toggleSemester(semester.semester_id)}
          >
            {semester.semester_name} {semester.year}
          </Button>
        ))}
      </div>

      <form onSubmit={handleSearch}>
        <label htmlFor="course-search">Search courses</label>
        <input
          id="course-search"
          type="search"
          placeholder="e.g. CS 210"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />

        {searchError && (
          <p className="text-danger" role="alert">
            {searchError}
          </p>
        )}
      </form>

      <div>
        {courses.map((course) => (
          <CourseCard key={course.course_id} course={course} />
        ))}
      </div>
    </section>
  );
}

export default Home;
