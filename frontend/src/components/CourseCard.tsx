import type { Course } from "../types/course";

type CourseCardProps = {
  course: Course;
};

function CourseCard({ course }: CourseCardProps) {
  return (
    <article className="card mb-3">
      <div className="card-body">
        <h2 className="h5 mb-1">
          {course.subject_code} {course.course_number}
        </h2>
        <p className="mb-0">{course.course_name}</p>
      </div>

      <ul className="list-group list-group-flush">
        {course.sections.map((section) => (
          <li key={section.section_id} className="list-group-item">
            <p className="mb-1">
              {section.semester_name} {section.year}
            </p>
            <p className="mb-0">{section.instructor_name}</p>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default CourseCard;
