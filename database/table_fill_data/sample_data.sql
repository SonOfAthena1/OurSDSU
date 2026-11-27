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
('A. Rivera', 4.0),
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
('2', 'Math'),
('1A', 'English Composition'),
('1B', 'Critical Thinking'),
('3B', 'Humanities'),
('3A', 'Arts');

-- Sample courses --
INSERT INTO courses(course_name, subject_code, course_number, course_description, prerequisites, ge_coverage, units) -- course id 1 - 10
VALUES
('Fundamentals of Computer Science I', 'CS', 101, 'Introductory course to the fundamentals of Computer Science.', NULL, NULL, 3),
('Fundamentals of Computer Science II', 'CS', 102, 'Intermediate course to the fundamentals of Computer Science.', 'CS 101', NULL, 3),
('Advanced Theaternomic studies', 'THEA', 104, 'Advanced course dedicated to film studies and lighting', NULL, 5, 3),
('Data Structure', 'CS', 210, 'Introduction to data structures.', NULL, NULL, 3),
('Introduction to statistics', 'MATH', 103, 'Introductory course to Statistics.', NULL, 1, 3),
('Early World History', 'HIST', 100, 'Survey of early societies and their connections before 1500.', NULL, 4, 3), -- 3B
('Rhetoric of Written Arguments in Context', 'RWS', 200, 'Evaluating arguments and using multiple sources to write for different audiences.', 'RWS 100 or equivalent', 3, 3), -- 1B
('Rhetoric of Written Argument', 'RWS', 100, 'Reading, evaluating, and composing written arguments.', 'SDSU written communication assessment requirement', 2, 3), -- 1A
('Comics and History', 'HIST', 157, 'How comics use words and images to tell stories and reflect historical change.', NULL, 5, 3), -- 3A
('Introduction to Logic', 'PHIL', 120, 'Deductive and inductive reasoning, common fallacies, and everyday uses of logic.', NULL, 1, 3); -- 2
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
(1, 1, 1, 10, 173000, 184500, 'M 120', 0, 60, 0), -- CS 101 taught by John Smith during Fall 2026
(1, 2, 1, 10, 123000, 134500, 'GMCS 333', 0, 100, 0), -- CS 101 taught by Mike Anderson during Fall 2026
(2, 3, 3, 10, 090000, 101500, 'GMCS 301', 30, 30, 0),
(3, 9, 3, 16, 140000, 153000, 'MUSIC 120', 40, 40, 5),
(3, 10, 3, 10, 120000, 131500, 'ENS 101', 10, 40, 0),
(3, 11, 3, 5, 130000, 141500, 'GMCS 331', 40, 40, 5),
(3, 5, 3, 5, 160000, 171500, 'GMCS 431', 35, 40, 0),
(4, 4, 1, 10, 090000, 101500, 'GMCS 333', 24, 30, 0),
(5, 6, 1, 4, 110000, 124000, 'GMCS 416', 20, 40, 0),
(5, 7, 1, 5, 110000, 115000, 'GMCS 421', 21, 40, 0),
(5, 8, 3, 16, 110000, 124000, 'GMCS 513', 40, 40, 20),
(6, 3, 1, 5, 090000, 101500, 'AH 2108', 28, 40, 0),
(7, 5, 1, 10, 110000, 121500, 'SH 101', 25, 25, 3),
(8, 10, 1, 5, 100000, 111500, 'SH 105', 21, 25, 0),
(9, 9, 1, 10, 140000, 151500, 'AH 2112', 34, 40, 0),
(10, 7, 1, 10, 130000, 141500, 'AL 101', 35, 35, 2),
(6, 3, 3, 5, 110000, 121500, 'AH 2108', 26, 40, 0),
(7, 5, 3, 10, 140000, 151500, 'SH 101', 22, 25, 0),
(6, 3, 5, 10, 090000, 101500, 'AH 2108', 18, 40, 0),
(7, 5, 5, 5, 110000, 121500, 'SH 101', 25, 25, 4),
(8, 10, 5, 10, 100000, 111500, 'SH 105', 20, 25, 0),
(9, 9, 5, 5, 140000, 151500, 'AH 2112', 38, 40, 0),
(10, 7, 5, 10, 130000, 141500, 'AL 101', 24, 35, 0),
-- Fall 2027 online asynchronous sections
(1, 2, 5, 0, NULL, NULL, 'Online', 32, 60, 0), -- CS 101
(5, 6, 5, 0, NULL, NULL, 'Online', 40, 40, 3), -- MATH 103
(6, 3, 5, 0, NULL, NULL, 'Online', 24, 40, 0), -- HIST 100
(10, 7, 5, 0, NULL, NULL, 'Online', 28, 35, 0); -- PHIL 120
