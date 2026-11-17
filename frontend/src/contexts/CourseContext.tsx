import { useEffect, useState, type ReactNode } from "react";
import { CourseContext } from "../hooks/useCourseContext";
import type { Course } from "../types/course";
//import { getCourses } from "../api/courses";
import { getCourses } from "../api/devCourses";
import type { Semester } from "../types/semester";
import type { GEcategory } from "../types/geCategory";
import { getSemesters } from "../api/devSemesters";
import { getGEcategories } from "../api/devGEcategories";

type CourseProviderProps = {
  children: ReactNode;
};

const CourseProvider = ({ children }: CourseProviderProps) => {
  // Add course state and actions here as the project grows.
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [geCategories, setGEcategories] = useState<GEcategory[]>([]);
  const [selectedSemesterIds, setSelectedSemesterIds] = useState<number[]>([]);

  const value = {
    courses,
    setCourses,
    semesters,
    setSemesters,
    selectedSemesterIds,
    setSelectedSemesterIds,
    geCategories,
    setGEcategories,
  };

  useEffect(() => {
    let ignore = false;

    async function loadCourses() {
      const data = await getCourses(selectedSemesterIds);

      if (!ignore) {
        setCourses(data);
      }
    }

    void loadCourses();

    return () => {
      ignore = true;
    };
  }, [selectedSemesterIds]);

  useEffect(() => {
    async function loadSemesters() {
      const data = await getSemesters();
      setSemesters(data);
    }

    void loadSemesters();
  }, []);

  useEffect(() => {
    async function loadGEcategories() {
      const data = await getGEcategories();
      setGEcategories(data);
    }

    void loadGEcategories();
  }, []);

  return (
    <CourseContext.Provider value={value}>{children}</CourseContext.Provider>
  );
};

export default CourseProvider;
