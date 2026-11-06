import { useState } from "react";
import type { Course } from "../types/course";

type CourseCardProps = {
  course: Course;
};



function CheckBox({ course }: CourseCardProps){
    const [inputs, setInputs] = useState({});
   
   return <h2>{course.course_name}</h2>;
 
}

export default CheckBox;