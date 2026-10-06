import { createContext, useContext } from 'react'

// An empty context value for now; add course fields when they are needed.
type CourseContextValue = Record<string, never>

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
