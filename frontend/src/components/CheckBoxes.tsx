import { useState } from "react";
import type { Course } from "../types/course";

type CourseCardProps = {
  course: Course;
};



function CheckBox({ course }: CourseCardProps){
    return(
        <label>
            <input type="checkbox" name="WEIIIII" />
        </label>
    );
 
}

export default CheckBox;