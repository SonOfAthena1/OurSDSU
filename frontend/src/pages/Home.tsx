import { useCourseContext } from "../hooks/useCourseContext";
import CourseCard from "../components/CourseCard";
import { useState, type SubmitEvent } from "react";

function Home() {
  const { courses } = useCourseContext();
  const [searchText, setSearchText] = useState("");

  function handleSearch(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log(searchText)
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
