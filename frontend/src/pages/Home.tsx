import { useCourseContext } from "../hooks/useCourseContext";
import CourseCard from "../components/CourseCard";

function Home() {
  const { courses } = useCourseContext();

  return (
    <section className="container py-5">
      <h1>Welcome to OurSDSU</h1>
      <p>Find courses and explore your next semester.</p>

      <div>
        {courses.map((course) => (
          <CourseCard key={course.course_id} course={course} />
        ))}
      </div>
    </section>
  );
}

export default Home;
