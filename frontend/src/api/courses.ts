
// code calling the backend goes here
import type { Course } from '../types/course'

type CoursesResponse = {
  results: Course[]
}

// TODO: Learn how to expand this a lot more with Codex
export async function getCourses(
  subject: string,
  courseNumber: number,
): Promise<Course[]> {
  const params = new URLSearchParams({
    subject,
    course_number: String(courseNumber),
  })

  const response = await fetch(
    `http://localhost:8000/courses?${params}`,
  )

  if (!response.ok) {
    throw new Error('Could not load courses')
  }

  const data: CoursesResponse = await response.json()

  return data.results
}