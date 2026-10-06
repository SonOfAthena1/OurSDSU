import type { ReactNode } from 'react'
import { CourseContext } from '../hooks/useCourseContext'

type CourseProviderProps = {
  children: ReactNode
}

const CourseProvider = ({ children }: CourseProviderProps) => {
  // Add course state and actions here as the project grows.
  const value = {}

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  )
}

export default CourseProvider
