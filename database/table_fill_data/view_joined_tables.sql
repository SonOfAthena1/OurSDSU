-- Open this file in MySQL Workbench and run the whole script after loading mock data.
-- Read-only: one row per section, with related names instead of foreign-key IDs.
-- Compare these rows with frontend/src/api/devCourses.ts.
-- section_id is kept so you can find the original section when something looks wrong.
-- LEFT JOIN keeps every section visible, even if a related record is missing.
-- NULL course, semester, or instructor details indicate a missing relationship.
-- NULL prerequisites or GE details can be normal: those course fields are optional.
USE oursdsu;

SELECT
    s.section_id,
    CONCAT(c.subject_code, ' ', c.course_number) AS course,
    c.course_name,
    CONCAT(sem.semester_name, ' ', sem.year) AS semester,
    i.instructor_name,
    i.instructor_rating,
    -- Decode the stored weekday bitmask: 10 becomes 'Tue / Thu'.
    CASE
        WHEN s.meeting_days = 0 THEN 'Asynchronous'
        ELSE CONCAT_WS(' / ',
            CASE WHEN (s.meeting_days & 1) <> 0 THEN 'Mon' END,
            CASE WHEN (s.meeting_days & 2) <> 0 THEN 'Tue' END,
            CASE WHEN (s.meeting_days & 4) <> 0 THEN 'Wed' END,
            CASE WHEN (s.meeting_days & 8) <> 0 THEN 'Thu' END,
            CASE WHEN (s.meeting_days & 16) <> 0 THEN 'Fri' END,
            CASE WHEN (s.meeting_days & 32) <> 0 THEN 'Sat' END,
            CASE WHEN (s.meeting_days & 64) <> 0 THEN 'Sun' END
        )
    END AS meeting_days,
    s.start_time,
    s.end_time,
    s.class_location,
    s.current_enrollment,
    s.max_enrollment,
    -- Keep negative values visible so over-enrollment is easy to spot.
    s.max_enrollment - s.current_enrollment AS available_seats,
    s.waitlist_size,
    c.units,
    gc.ge_category_code,
    gc.ge_category,
    c.prerequisites,
    c.course_description
FROM sections AS s
LEFT JOIN courses AS c
    ON s.course_id = c.course_id
LEFT JOIN semesters AS sem
    ON s.semester_offered_id = sem.semester_id
LEFT JOIN instructors AS i
    ON s.instructor_id = i.instructor_id
LEFT JOIN ge_categories AS gc
    ON c.ge_coverage = gc.ge_category_id
ORDER BY
    sem.year,
    FIELD(sem.semester_name, 'Winter', 'Spring', 'Summer', 'Fall'),
    c.subject_code,
    c.course_number,
    s.section_id;
