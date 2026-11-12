-- Sample data for some fake users that do not exist
INSERT INTO users(email, password_hash, display_name)
VALUES
('testUser1@gmail.com', 'gmailPassword', 'gmailUser'),
('testUser2@yahoo.com', 'yahooPassword', 'yahooUser'),
('testUser3@sdsu.edu', 'sdsuPassword', 'sdsuUser'); 

-- Sample data for some fake instructors that do not exist
INSERT INTO instructors(instructor_name, instructor_rating)
VALUES
('John Smith', 1.0), 
('Mike Anderson', 3.0), 
('A. Rivera', 4.0), -- 1
('B. Rivera', 4.5),
('Mary Jane', 5.0),
('Asaba Harumasa', 4.0),
('John Math', 4.5),
('Ethan Teto', 5.0),
('Money De Luffa', 4.9),
('San Xi', 3.8),
('Zo Lo', 5.0);

-- Sample GE requirements --
INSERT INTO ge_categories(ge_category_code, ge_category)
VALUES
('0A', 'Mathematics');

-- Sample courses --
INSERT INTO courses(course_name, subject_code, course_number, course_description, prerequisites, ge_coverage, units) -- course id 1 - 5
VALUES
('Fundamentals of Computer Science I', 'CS', 101, 'Introductory course to the fundamentals of Computer Science.', NULL, NULL, 3),
('Fundamentals of Computer Science II', 'CS', 102, 'Intermediate course to the fundamentals of Computer Science.', 'CS 001', NULL, 3),
('Advanced Theaternomic studies', 'THEA', 104, 'Advanced course dedicated to film studies and lighting', NULL, NULL, 3),
('Data Structure', 'CS', 210, 'Introduction to data structures.', NULL, NULL, 3),
('Introduction to statistics', 'MATH', 103, 'Introductory course to Statistics.', NULL, NULL, 3);
-- Sample data for semesters --
INSERT INTO semesters(semester_name, year)
VALUES
('Fall', 2026), -- 1 - 5
('Winter', 2026),
('Spring', 2027),
('Summer', 2027),
('Fall', 2027);

-- Sample sections --
INSERT INTO sections(course_id, instructor_id, semester_offered_id, meeting_days, start_time, end_time, class_location, current_enrollment, max_enrollment, waitlist_size)
VALUES
-- Assuming I understood it correctly, it'd be 10 for Tuesday/Thursday, or would it be 00001010?
(1, 1, 1, 10, 173000, 184500, 'M 120', 0, 60, 0), -- CS 001 taught by John Smith during Fall 2026
(1, 2, 1, 10, 123000, 134500, 'GMCS 333', 0, 100, 0), -- CS 001 taught by Mike Anderson during Fall 2026
(2, 3, 3, 10, 090000, 101500, 'GMCS 301', 30, 30, 0),
(3, 9, 3, 11, 140000, 153000, 'MUSIC 120', 40, 40, 5),
(3, 10, 3, 10, 120000, 131500, 'ENS 101', 10, 40, 0),
(3, 11, 3, 01, 160000, 171500, 'GMCS 431', 30, 40, 0),
(3, 5, 3, 00, 160000, 171500, 'GMCS 431', 35, 40, 0),
(4, 4, 1, 10, 090000, 101500, 'GMCS 333', 24, 30, 0),
(5, 6, 1, 11, 110000, 124000, 'GMCS 416', 20, 40, 0),
(5, 7, 1, 00, 110000, 115000, 'GMCS 421', 21, 40, 0),
(5, 8, 3, 00, 110000, 124000, 'GMCS 513', 40, 40, 20)
-- 000000 9 