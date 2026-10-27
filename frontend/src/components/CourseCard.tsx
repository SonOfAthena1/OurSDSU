import type { Course } from "../types/course";

type CourseCardProps = {
  course: Course;
};

function CourseCard({ course }: CourseCardProps) {
  return (
    <article>
      <h2>
        {course.subject_code} {course.course_number}
      </h2>
      <p>{course.course_name}</p>
    </article>
  );
}

export default CourseCard;
