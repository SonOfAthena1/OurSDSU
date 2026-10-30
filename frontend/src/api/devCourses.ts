import type { Course } from "../types/course";

const sampleResponse: { results: Course[] } = {
  results: [
    {
      course_id: 42,
      subject_code: "CS",
      course_number: 210,
      course_name: "Data Structures",
      course_description: "Introduction to data structures.",
      units: 3,
      sections: [
        {
          section_id: 101,
          semester_id: 3,
          semester_name: "Fall",
          year: 2026,
          instructor_name: "A. Rivera",
          meeting_days: ["Tue", "Thu"],
          start_time: "09:00:00",
          end_time: "10:15:00",
          class_location: "GMCS 301",
          current_enrollment: 24,
          max_enrollment: 30,
          waitlist_size: 0,
        },
      ],
    },

    {
      course_id: 43,
      subject_code: "CS",
      course_number: 102,
      course_name: "Fundamentals of Computer Science II",
      course_description:
        "Intermediate course to the fundamentals of Computer Science.",
      units: 3,
      sections: [
        {
          section_id: 101,
          semester_id: 3,
          semester_name: "Fall",
          year: 2026,
          instructor_name: "A. Rivera",
          meeting_days: ["Tue", "Thu"],
          start_time: "09:00:00",
          end_time: "10:15:00",
          class_location: "GMCS 301",
          current_enrollment: 24,
          max_enrollment: 30,
          waitlist_size: 0,
        },
      ],
    },

    {
      course_id: 44,
      subject_code: "CS",
      course_number: 100,
      course_name: "Fundamentals of Computer Science I",
      course_description:
        "Introductory course to the fundamentals of Computer Science.",
      units: 3,
      sections: [
        // when referencing sample_data, where does instructor_id go, what correlates to section id
        {
          section_id: 1,
          semester_id: 1,
          semester_name: "Fall",
          year: 2026,
          instructor_name: "John Smith",
          meeting_days: ["Tue", "Thu"],
          start_time: "09:00:00",
          end_time: "10:15:00",
          class_location: "M 120",
          current_enrollment: 0,
          max_enrollment: 60,
          waitlist_size: 0,
        },
        {
          section_id: 2,
          semester_id: 1,
          semester_name: "Fall",
          year: 2026,
          instructor_name: "Mike Anderson",
          meeting_days: ["Tue", "Thu"],
          start_time: "06:00:00",
          end_time: "8:15:00",
          class_location: "GMCS 333",
          current_enrollment: 0,
          max_enrollment: 100,
          waitlist_size: 0,
        },
      ],
    },
    {
      course_id: 53,
      subject_code: "STAT 250",
      course_number: 10,
      course_name: "Introduction to statistics",
      course_description:
      "Introductory course to Statistics.",
      units: 3,
      sections: [
        {
          section_id: 1,
          semester_id: 1,
          semester_name: "Fall",
          year: 2026,
          instructor_name: "Asaba Harumasa",
          meeting_days: ["Wed"],
          start_time: "11:00:00",
          end_time: "12:40:00",
          class_location: "GMCS 416",
          current_enrollment: 20,
          max_enrollment: 40,
          waitlist_size: 0,
        }]
    },

    {
      course_id: 80,
      subject_code: "Theater 450",
      course_number: 10,
      course_name: "Advanced Theaternomic studies",
      course_description:
      "Advanced course dedicated to film studies and lighting",
      units: 3,
      sections: [
        {
          section_id: 1,
          semester_id: 3,
          semester_name: "Spring",
          year: 2027,
          instructor_name: "Money De Luffa",
          meeting_days: ["Friday"],
          start_time: "15:00:00",
          end_time: "14:30:00",
          class_location: "MUSIC 120",
          current_enrollment: 40,
          max_enrollment: 40,
          waitlist_size: 5,
        }]
    },

  ],
};

export async function getCourses() {
  return sampleResponse.results;
}
