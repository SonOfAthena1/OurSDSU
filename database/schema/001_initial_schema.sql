CREATE DATABASE IF NOT EXISTS oursdsu;
USE oursdsu;


-- THIS IS NOT FUNCTIONAL, JUST THE INITIAL SCHEME DRAFT SETUP 



CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,

    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,

    display_name VARCHAR(100),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE courses (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(?) NOT NULL,
    subject_code VARCHAR(?)
    course_number SMALLINT NOT NULL,
    course_description TEXT NOT NULL,

    prerequisites VARCHAR(?),
    ge_coverage INT,  
    units TINYINT NOT NULL,

    UNIQUE(subject_code, course_number)
    FOREIGN_KEY(ge_coverage) REFERENCES ge_categories(ge_category_id)
);

CREATE TABLE ge_categories (
    ge_category_id INT AUTO_INCREMENT PRIMARY KEY
  
  ge_category VARCHAR(?) NOT NULL UNIQUE
);

CREATE TABLE instructors (
   instructor_id INT AUTO_INCREMENT PRIMARY KEY,
   name VARCHAR(?) NOT NULL,
   instructor_rating DECIMAL(2,1),
);

CREATE TABLE semesters (
    semester_id INT AUTO_INCREMENT PRIMARY KEY,
    semester_name VARCHAR(10) NOT NULL,
    year INT NOT NULL,
    
    CONSTRAINT check_valid_semester CHECK (semester_name IN (‘Fall’, ‘Winter’, ‘Spring’, ‘Summer’)
);

CREATE TABLE sections (
    section_id INT AUTO_INCREMENT PRIMARY KEY,
    class INT NOT NULL,
    instructor INT NOT NULL,
    semester_offered INT NOT NULL,

    FOREIGN_KEY(class) REFERENCES courses(course_id),
    FOREIGN_KEY(instructor) REFERENCES instructors(instructor_id),
    FOREIGN_KEY(semester_offered) REFERENCES semesters(semester_id),

    meeting_days TINYINT UNSIGNED NOT NULL*,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    class_location VARCHAR(?) NOT NULL,

    current_enrollment INT NOT NULL,
    max_enrollment INT NOT NULL,
    waitlist_size INT,
);
