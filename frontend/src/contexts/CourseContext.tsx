import { useEffect, useState, type ReactNode } from "react";
import { CourseContext } from "../hooks/useCourseContext";
import type { Course } from "../types/course";
import type { SearchFilters } from "../types/SearchFilters";
import { getCourses } from "../api/courses";
import type { Semester } from "../types/semester";
import type { GEcategory } from "../types/geCategory";
import { getSemesters } from "../api/semesters";
import { getGEcategories } from "../api/GEcategories";
// import { getSemesters } from "../api/devSemesters";
// import { getCourses } from "../api/devCourses";
// import { getGEcategories } from "../api/devGEcategories";

type CourseProviderProps = {
  children: ReactNode;
};

const CourseProvider = ({ children }: CourseProviderProps) => {
  // Add course state and actions here as the project grows.
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [geCategories, setGEcategories] = useState<GEcategory[]>([]);

  const [selectedSemesterId, setSelectedSemesterId] = useState<number>(0);
  const [submittedSearch, setSubmittedSearch] = useState<{
    subject: string;
    courseNumber?: number | null;
  } | null>(null);
  const [selectedGECategoryIds, setSelectedGECategoryIds] = useState<number[]>(
    [],
  );
  const [dayMaskList, setDayMaskList] = useState<number[]>([]);
  const [startAfter, setStartAfter] = useState<number>(0);
  const [startBefore, setStartBefore] = useState<number>(23);

  /**
   * The actual context object's value
   */
  const value = {
    courses,
    setCourses,
    semesters,
    setSemesters,
    geCategories,
    setGEcategories,
    selectedSemesterId,
    setSelectedSemesterId,
    submittedSearch,
    setSubmittedSearch,
    selectedGECategoryIds,
    setSelectedGECategoryIds,
    dayMaskList,
    setDayMaskList,
    startAfter,
    setStartAfter,
    startBefore,
    setStartBefore,
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

  // Calls getCourses(filterParams)
  useEffect(() => {
    if (selectedSemesterId === 0) return;
    let ignore = false;
    let daysMask: number | null = null;

    if (dayMaskList.length !== 0) {
      daysMask = dayMaskList.reduce((total, current) => total + current, 0);
    }

    // set some variable equal to properly formatted string

    // set start before time to 24
    // set start after to 1
    const startAfterStr = `${String(Math.trunc(startAfter)).padStart(2, "0")}:${String((startAfter % 1) * 60).padStart(2, "0")}:00`;
    const setBeforeStr = `${String(Math.trunc(startBefore)).padStart(2, "0")}:${String((startBefore % 1) * 60).padStart(2, "0")}:00`;

    const searchFilter: SearchFilters = {
      subject: submittedSearch?.subject,
      courseNumber: submittedSearch?.courseNumber,
      geCategories: selectedGECategoryIds,
      days: daysMask,
      earlyStartTime: startAfterStr,
      laterStartTime: setBeforeStr,
      // earlyStartTime: range
    };

    async function loadCourses() {
      const data = await getCourses(selectedSemesterId, searchFilter);

      if (!ignore) {
        setCourses(data);
      }
    }

    void loadCourses();

    return () => {
      ignore = true;
    };
  }, [
    submittedSearch,
    selectedSemesterId,
    selectedGECategoryIds,
    dayMaskList,
    startAfter,
    startBefore,
  ]);

  return (
    <CourseContext.Provider value={value}>{children}</CourseContext.Provider>
  );
};

export default CourseProvider;
