import { useCourseContext } from "../hooks/useCourseContext";
import CourseCard from "../components/CourseCard";
import { useState } from "react";

function Home() {
  const { courses } = useCourseContext();
  const [searchText, setSearchText] = useState("");

  return (
    <section className="container py-5">
      <h1>Welcome to OurSDSU</h1>
      <p>Find courses and explore your next semester.</p>

      
      <label htmlFor="course-search">Search courses</label>
      <input
        id="course-search"
        type="search"
        placeholder="e.g. CS 210"
        value={searchText}
        onChange={(event) => setSearchText(event.target.value)}
      />

      <div>
        {courses.map((course) => (
          <CourseCard key={course.course_id} course={course} />
        ))}
      </div>
    </section>
  );
}

export default Home;
