import type { Course } from '../types/course'

const sampleResponse: { results: Course[] } = {
  "results": [
    {
      "course_id": 42,
      "subject_code": "CS",
      "course_number": 210,
      "course_name": "Data Structures",
      "course_description": "Introduction to data structures.",
      "units": 3,
      "sections": [
        {
          "section_id": 101,
          "semester_id": 3,
          "semester_name": "Fall",
          "year": 2026,
          "instructor_name": "A. Rivera",
          "meeting_days": ["Tue", "Thu"],
          "start_time": "09:00:00",
          "end_time": "10:15:00",
          "class_location": "GMCS 301",
          "current_enrollment": 24,
          "max_enrollment": 30,
          "waitlist_size": 0
        }
      ]
    },

    {
      "course_id": 42,
      "subject_code": "CS",
      "course_number": 2,
      "course_name": "Fundamentals of Computer Science II",
      "course_description": "Intermediate course to the fundamentals of Computer Science.",
      "units": 3,
      "sections": [
        {
          "section_id": 101,
          "semester_id": 3,
          "semester_name": "Fall",
          "year": 2026,
          "instructor_name": "A. Rivera",
          "meeting_days": ["Tue", "Thu"],
          "start_time": "09:00:00",
          "end_time": "10:15:00",
          "class_location": "GMCS 301",
          "current_enrollment": 24,
          "max_enrollment": 30,
          "waitlist_size": 0
        }
      ]
    },

     {
      "course_id": 42,
      "subject_code": "CS",
      "course_number": 1,
      "course_name": "Fundamentals of Computer Science I",
      "course_description": "Introductory course to the fundamentals of Computer Science.",
      "units": 3,
      "sections": [
        // when referencing sample_data, where does instructor_id go, what correlates to section id 
        {
          "section_id": 1,
          "semester_id": 1,
          "semester_name": "Fall",
          "year": 2026,
          "instructor_name": "John Smith",
          "meeting_days": ["Tue", "Thu"],
          "start_time": "09:00:00",
          "end_time": "10:15:00",
          "class_location": "M 120",
          "current_enrollment": 0,
          "max_enrollment": 60,
          "waitlist_size": 0
        },
        {
          "section_id": 2,
          "semester_id": 1,
          "semester_name": "Fall",
          "year": 2026,
          "instructor_name": "Mike Anderson",
          "meeting_days": ["Tue", "Thu"],
          "start_time": "06:00:00",
          "end_time": "8:15:00",
          "class_location": "GMCS 333",
          "current_enrollment": 0,
          "max_enrollment": 100,
          "waitlist_size": 0
        }
      ]
    },
  ]

}






function getCourses(){
    return sampleResponse.results;
}