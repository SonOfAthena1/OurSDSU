
export type Course = {
  course_id: number
  subject_code: string
  course_number: number
  course_name: string
  course_description: string
  units: number
  sections: Section[]
}

export type Section = {
  section_id: number
  instructor_name: string
  meeting_days: string[]
  start_time: string
  end_time: string
}