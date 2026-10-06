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
('Mary Jane', 5.0);

-- Sample GE requirements --
INSERT INTO ge_categories(ge_category)
VALUES
('Mathematics');

-- Sample courses --
INSERT INTO courses(course_name, subject_code, course_number, course_description, prerequisites, ge_coverage, units)
VALUES
('Fundamentals of Computer Science I', 'CS', 001, 'Introductory course to the fundamentals of Computer Science.', NULL, NULL, 3),
('Fundamentals of Computer Science II', 'CS', 002, 'Intermediate course to the fundamentals of Computer Science.', 'CS 001', NULL, 3);

-- Sample data for semesters --
INSERT INTO semesters(semester_name, year)
VALUES
('Fall', 2026),
('Winter', 2026),
('Spring', 2027),
('Summer', 2027),
('Fall', 2027);

-- Sample sections --
INSERT INTO sections(course_id, instructor_id, semester_offered_id, meeting_days, start_time, end_time, class_location, current_enrollment, max_enrollment, waitlist_size)
VALUES
-- Assuming I understood it correctly, it'd be 10 for Tuesday/Thursday, or would it be 00001010?
(1, 1, 1, 10, 173000, 184500, 'M 120', 0, 60, 0), -- CS 001 taught by John Smith during Fall 2026
(1, 2, 1, 10, 123000, 134500, 'GMCS 333', 0, 100, 0) -- CS 001 taught by Mike Anderson during Fall 2026
