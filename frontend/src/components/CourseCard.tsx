import type { Course } from "../types/course";

type CourseCardProps = {
  course: Course;
};

function CourseCard({ course }: CourseCardProps) {
  return (
    <article className="card mb-3">
      <div className="card-body">
        <h2 className="h5 mb-1">
          {course.subject_code} {course.course_number}: {course.course_name}
        </h2>
      </div>

      <div className="px-3 py-2">
        <div className="row g-3">
          <div className="col-12 col-md-2">
            <div className="small text-body-secondary">Semester</div>
          </div>

          <div className="col-12 col-md-2">
            <div className="small text-body-secondary">Days</div>
          </div>

          <div className="col-12 col-md-2">
            <div className="small text-body-secondary">Time</div>
          </div>

          <div className="col-12 col-md-2">
            <div className="small text-body-secondary">Instructor</div>
          </div>

          <div className="col-12 col-md-2">
            <div className="small text-body-secondary">Location</div>
          </div>

          <div className="col-12 col-md-2">
            <div className="small text-body-secondary">Capacity</div>
          </div>
        </div>
      </div>

      <ul className="list-group list-group-flush">
        {course.sections.map((section) => (
          <li key={section.section_id} className="list-group-item">
            {/* <div className="fw-semibold mb-2">
              {section.semester_name} {section.year}
            </div> */}
            <div className="row g-3">
              <div className="col-12 col-md-2">
                <div>
                  {section.semester_name} {section.year}
                </div>
              </div>

              <div className="col-12 col-md-2">
                <div>
                  {section.meeting_days.length > 0
                    ? section.meeting_days.join(" / ")
                    : "Days not listed"}
                </div>
              </div>

              <div className="col-12 col-md-2">
                <div>
                  {section.start_time && section.end_time
                    ? `${section.start_time} – ${section.end_time}`
                    : "Time not listed"}
                </div>
              </div>

              <div className="col-12 col-md-2">
                <div>{section.instructor_name}</div>
              </div>

              <div className="col-12 col-md-2">
                <div>{section.class_location}</div>
              </div>

              <div className="col-12 col-md-2">
                <div>{section.max_enrollment} seats</div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default CourseCard;
