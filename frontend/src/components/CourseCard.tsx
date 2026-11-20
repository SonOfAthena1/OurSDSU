import type { Course } from "../types/course";
import { useState } from "react";
import { Button, Collapse } from "react-bootstrap";

type CourseCardProps = {
  course: Course;
};

function CourseCard({ course }: CourseCardProps) {
  const [sectionsOpen, setSectionsOpen] = useState(true);
  const sectionsId = `course-${course.course_id}-sections`;

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
            <div className="small text-body-secondary d-flex align-items-center gap-1">
              <Button
                type="button"
                variant="link"
                className="px-1 py-0 text-body-secondary text-decoration-none"
                aria-label={sectionsOpen ? "Hide sections" : "Show sections"}
                aria-expanded={sectionsOpen}
                aria-controls={sectionsId}
                onClick={() => setSectionsOpen((previousOpen) => !previousOpen)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d={sectionsOpen ? "M6 9 L12 15 L18 9" : "M9 6 L15 12 L9 18"}
                  />
                </svg>
              </Button>
              <span>Semester</span>
            </div>
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

      <Collapse in={sectionsOpen}>
        <div id={sectionsId}>
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
        </div>
      </Collapse>
    </article>
  );
}

export default CourseCard;
