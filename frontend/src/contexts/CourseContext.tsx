import { useState, type ReactNode } from 'react'
import { CourseContext } from '../hooks/useCourseContext'
import type { Course } from '../types/course'

type CourseProviderProps = {
  children: ReactNode
}

const CourseProvider = ({ children }: CourseProviderProps) => {
  // Add course state and actions here as the project grows.
  const [courses, setCourses] = useState<Course[]>([])

  const value = { courses, setCourses }

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  )
}

export default CourseProvider
