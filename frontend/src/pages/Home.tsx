import { useCourseContext } from "../hooks/useCourseContext";
import CourseCard from "../components/CourseCard";
import { useState, type SubmitEvent } from "react";

function Home() {
  const { courses } = useCourseContext();
  const [searchText, setSearchText] = useState("");
  const [searchError, setSearchError] = useState("");

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
  }

  return (
    <section className="container py-5">
      <h1>Welcome to OurSDSU</h1>
      <p>Find courses and explore your next semester.</p>

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
