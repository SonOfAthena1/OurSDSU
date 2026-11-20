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
  const [selectedSemesterId, setSelectedSemesterId] = useState<number>(0);
  const [selectedGECategoryIds, setSelectedGECategoryIds] = useState<number[]>(
    [],
  );

  const value = {
    courses,
    setCourses,
    semesters,
    setSemesters,
    selectedSemesterId,
    setSelectedSemesterId,
    geCategories,
    setGEcategories,
    selectedGECategoryIds,
    setSelectedGECategoryIds,
  };

  useEffect(() => {
    async function loadSemesters() {
      const data = await getSemesters();

      setSemesters(data.slice(0, 4).reverse());
      setSelectedSemesterId(data[0]?.semester_id ?? 0);
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

  useEffect(() => {
    if (selectedSemesterId === 0) return;
    let ignore = false;

    async function loadCourses() {
      const data = await getCourses(selectedSemesterId);

      if (!ignore) {
        setCourses(data);
      }
    }

    void loadCourses();

    return () => {
      ignore = true;
    };
  }, [selectedSemesterId]);

  return (
    <CourseContext.Provider value={value}>{children}</CourseContext.Provider>
  );
};

export default CourseProvider;
