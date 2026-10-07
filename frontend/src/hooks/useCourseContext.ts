import { createContext, useContext, type Dispatch, type SetStateAction } from 'react'
import type { Course } from '../types/course'

type CourseContextValue = {
  courses: Course[]
  setCourses: Dispatch<SetStateAction<Course[]>>
}

export const CourseContext = createContext<CourseContextValue | undefined>(
  undefined,
)

export const useCourseContext = () => {
  const ctx = useContext(CourseContext)
  if (ctx === undefined) {
    throw new Error('useCourseContext must be used within a CourseProvider')
  }
  return ctx
}
