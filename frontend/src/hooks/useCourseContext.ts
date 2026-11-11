import {
  createContext,
  useContext,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { Course } from "../types/course";
import type { Semester } from "../types/semester";
import type { GEcategory } from "../types/geCategory";

type CourseContextValue = {
  courses: Course[];
  semesters: Semester[];
  geCategories: GEcategory[];
  setCourses: Dispatch<SetStateAction<Course[]>>;
  setSemesters: Dispatch<SetStateAction<Semester[]>>;
  setGEcategories: Dispatch<SetStateAction<GEcategory[]>>;
};

export const CourseContext = createContext<CourseContextValue | undefined>(
  undefined,
);

export const useCourseContext = () => {
  const ctx = useContext(CourseContext);
  if (ctx === undefined) {
    throw new Error("useCourseContext must be used within a CourseProvider");
  }
  return ctx;
};
