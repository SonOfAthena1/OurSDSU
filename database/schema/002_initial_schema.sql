CREATE DATABASE IF NOT EXISTS oursdsu;
USE oursdsu;
SET FOREIGN_KEY_CHECKS = 0;

-- INITIAL SCHEMA DRAFT SETUP 


DROP TABLE IF EXISTS users;
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,

    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,

    display_name VARCHAR(100),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);


DROP TABLE IF EXISTS ge_categories;
CREATE TABLE ge_categories (
    ge_category_id INT AUTO_INCREMENT PRIMARY KEY,
    
    ge_category_code CHAR(2) NOT NULL UNIQUE,
    ge_category VARCHAR(40) NOT NULL UNIQUE
);


DROP TABLE IF EXISTS courses;
CREATE TABLE courses (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(100) NOT NULL,    -- i.e. Data Structures
    subject_code VARCHAR(15) NOT NULL,   -- i.e. CS
    course_number SMALLINT NOT NULL,     -- i.e. 210
    course_description TEXT NOT NULL,

    prerequisites VARCHAR(100),
    ge_coverage INT,  
    units TINYINT NOT NULL,

    UNIQUE(subject_code, course_number),
    FOREIGN KEY(ge_coverage) REFERENCES ge_categories(ge_category_id)
);


DROP TABLE IF EXISTS instructors;
CREATE TABLE instructors (
   instructor_id INT AUTO_INCREMENT PRIMARY KEY,
   instructor_name VARCHAR(100) NOT NULL,
   instructor_rating DECIMAL(2,1)
);


DROP TABLE IF EXISTS semesters;
CREATE TABLE semesters (
    semester_id INT AUTO_INCREMENT PRIMARY KEY,
    semester_name VARCHAR(10) NOT NULL,
    year INT UNSIGNED NOT NULL,
    
    CONSTRAINT check_valid_semester_season CHECK (semester_name IN ('Fall', 'Winter', 'Spring', 'Summer')),
    CONSTRAINT check_valid_semester_year CHECK (year > 1900)
    -- Note that we need checks to make sure no semester years are collected too far in the future. 
);


DROP TABLE IF EXISTS sections;
CREATE TABLE sections (
    section_id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    instructor_id INT NOT NULL,
    semester_offered_id INT NOT NULL,

    FOREIGN KEY(course_id) REFERENCES courses(course_id),
    FOREIGN KEY(instructor_id) REFERENCES instructors(instructor_id),
    FOREIGN KEY(semester_offered_id) REFERENCES semesters(semester_id),

    -- This is a bit mask. We make it so that every day corresponds to one of the bits, 
    -- so 00001010 might mean Thu/Tue, and 00010101 is Fri/Wed/Mon. You can do this by 
    -- mapping every day like so: Mon -> 1, Tue -> 2, Wed -> 4, Thu -> 8, Fri -> 16, 
    -- Sat -> 32, Sun -> 64.
    -- Hence, you can add them up to get the perfect byte mask, as Tue is 00000010 and 
    -- Thu is 00001000, so adding them up or 2+8=10 is 00001010.
    meeting_days TINYINT UNSIGNED NOT NULL, 
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    class_location VARCHAR(30) NOT NULL,

    current_enrollment INT NOT NULL,
    max_enrollment INT NOT NULL,
    waitlist_size INT
);
