-- This clears data from all tables 
-- (Do not run unless you are sure you want to empty data) 

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE sections;
TRUNCATE TABLE courses;
TRUNCATE TABLE instructors;
TRUNCATE TABLE semesters;
TRUNCATE TABLE ge_categories;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;