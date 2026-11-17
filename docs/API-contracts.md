# OurSDSU API contracts

An API contract is a shared agreement about what the frontend sends to the backend and what the backend sends back. Agree on the names, types, and behavior here **before** implementing a search feature. The examples below describe the intended API; they are not routes that already work.

For each new filter, update the relevant contract together, then implement the React control, FastAPI parameter, database query, and displayed result using the same names and rules.

## Proposed first contract: Find a course and its sections in a selected semester

Every course search must include exactly one selected semester. A semester means a specific season and year, such as Fall 2026 or Spring 2027.

**Request (one semester):** `GET /courses?subject_code=CS&course_number=210&semester_id=3`

For these examples, semester ID `3` represents Fall 2026. This ID is illustrative; the frontend must use the actual IDs from the `semesters` table.

| Query parameter | Type | Meaning |
| --- | --- | --- |
| `semester_id` | positive integer, required; exactly one | ID of the selected semester. Supply this query parameter once; do not use repeated parameters or a comma-separated string. |

The backend searches the `courses` table by `subject_code` and `course_number`, then includes only sections whose `semester_offered_id` equals the selected `semester_id`.

Each course appears once in `results`; all its matching sections go in its `sections` array. Sections from other semesters are excluded. A course with no sections in the selected semester is omitted. If no courses have matching sections, return HTTP 200 with `"results": []`.

**Validation:** Return HTTP 422 if `semester_id` is missing, empty, non-integer, non-positive, or nonexistent. Also return HTTP 422 if `semester_id` is supplied more than once, even if the values are identical. The frontend must allow exactly one semester selection per search, and the backend must enforce the same requirement independently. A missing semester must never default to searching all semesters.

**Successful response:** HTTP 200, JSON. This is illustrative data, not a claim that the local database already contains this course or section.

```json
{
  "results": [
    {
      "course_id": 42,
      "subject_code": "CS",
      "course_number": 210,
      "course_name": "Data Structures",
      "course_description": "Introduction to data structures.",
      "units": 3,
      "sections": [
        {
          "section_id": 101,
          "semester_id": 3,
          "semester_name": "Fall",
          "year": 2026,
          "instructor_name": "A. Rivera",
          "meeting_days": ["Tue", "Thu"],
          "start_time": "09:00:00",
          "end_time": "10:15:00",
          "class_location": "GMCS 301",
          "current_enrollment": 24,
          "max_enrollment": 30,
          "waitlist_size": 0
        }
      ]
    }
  ]
}
```

`course_number`, IDs, enrollment counts, and units are JSON numbers. Times use `HH:MM:SS` strings. In the database, `sections.meeting_days` is a bitmask: Mon = 1, Tue = 2, Wed = 4, Thu = 8, Fri = 16, Sat = 32, and Sun = 64 (numbers here correspond to their bit positions). If the byte is 0, that means the class is asynch. The backend decodes that number into the `meeting_days` array of weekday strings in the response, ordered Mon through Sun; for example, a stored value of `10` becomes `["Tue", "Thu"]`. React displays those strings and does not need to decode the bitmask. `semester_id` in the response comes from `sections.semester_offered_id` in the database. The backend gets `semester_name` and `year` from `semesters`, and `instructor_name` from `instructors`.


### Request Semester (required):
- Request (one semester): `GET /courses?semester_id=3`

```json
{
  "results": [
    {
      "course_id": 42,
      "subject_code": "CS",
      "course_number": 210,
      "course_name": "Data Structures",
      "course_description": "Introduction to data structures.",
      "units": 3,
      "sections": [
        {
          "section_id": 101,
          "semester_id": 3,
          "semester_name": "Fall",
          "year": 2026,
          "instructor_name": "A. Rivera",
          "meeting_days": ["Tue", "Thu"],
          "start_time": "09:00:00",
          "end_time": "10:15:00",
          "class_location": "GMCS 301",
          "current_enrollment": 24,
          "max_enrollment": 30,
          "waitlist_size": 0
        },
        {
          "section_id": 120,
          "semester_id": 3,
          "semester_name": "Fall",
          "year": 2026,
          "instructor_name": "Brandon",
          "meeting_days": ["Mon", "Wed", "Fri"],
          "start_time": "12:00:00",
          "end_time": "01:15:00",
          "class_location": "HH 227",
          "current_enrollment": 43,
          "max_enrollment": 60,
          "waitlist_size": 0
        }
      ]
    }
  ]
}
```

### Request Days:
- Request (one set of days): `GET /courses?semester_id=3&days=10`
    - Returns classes whose bitmask number matches the number in the request. 
    - 10 means 2+8, which is Tue/Thu, so classes only on Tue/Thu get returned.
    - Days int should theoretically only range between 0 and 31, as no classes should be on Sat or Sunday.
    - Days is 0 means the class is asynch, so the meeting days array should just have `["Asynchronous"]`

```json
{
  "results": [
    {
      "course_id": 42,
      "subject_code": "CS",
      "course_number": 210,
      "course_name": "Data Structures",
      "course_description": "Introduction to data structures.",
      "units": 3,
      "sections": [
        {
          "section_id": 101,
          "semester_id": 3,
          "semester_name": "Fall",
          "year": 2026,
          "instructor_name": "A. Rivera",
          "meeting_days": ["Tue", "Thu"],
          "start_time": "09:00:00",
          "end_time": "10:15:00",
          "class_location": "GMCS 301",
          "current_enrollment": 24,
          "max_enrollment": 30,
          "waitlist_size": 0
        },
        {
          "section_id": 120,
          "semester_id": 3,
          "semester_name": "Fall",
          "year": 2026,
          "instructor_name": "Brandon",
          "meeting_days": ["Tue", "Thu"],
          "start_time": "12:00:00",
          "end_time": "13:15:00",
          "class_location": "HH 227",
          "current_enrollment": 43,
          "max_enrollment": 60,
          "waitlist_size": 0
        }
      ]
    },
    {
      "course_id": 45,
      "subject_code": "CS",
      "course_number": 240,
      "course_name": "Data Structures",
      "course_description": "Introduction to data structures.",
      "units": 3,
      "sections": []
    }
  ]
}
```

### Important Note:
How filters combine:
- Different filters use **AND**: subject matches and units match and the section is open.
- Multiple values within one filter use **OR**: CS or RWS; 3 or 4 units. This does not apply to `semester_id`, which accepts exactly one value.

### Request GE Categories:
- Request (one ge): `GET /courses?semester_id=3&ge_category_id=6`   
- Request (multiple ge's): `GET /courses?semester_id=3&ge_category_id=6&ge_category_id=4`
  
### Request Class Times:
- Request (classes start at this time or later): 
`GET /courses?semester_id=3&early_start_time=09:00:00`    
- Request (earliest start time, latest start time): 
`GET /courses?semester_id=3&early_start_time=12:00:00&late_start_time=18:00:00`    
     
### Request locations:
- Request (locations, online): `GET /courses?semester_id=3&location=online`   
    - Returns all classes where location=online.
- Request (locations, in-person): `GET /courses?semester_id=3&location=in_person`   
    - Returns all classes where location!=online
    
### Request Class Subjects
- Request (subject): `GET /courses?semester_id=3&subject_code=cs`   
- Request (multiple subjects): `GET /courses?semester_id=3&subject_code=cs&subject_code=rws`
    
### Request Units:
- Request (units): `GET /courses?semester_id=3&units=3`   
- Request (multiple units): `GET /courses?semester_id=3&units=3&units=4&units=5`
    
### Request Existing Semesters:
- Request (semesters that exist): `GET /semesters`  
    - Returns: All of the semesters that exist in the DB.
    - No query parameters are required. 
    - Order the semesters first by year, then by season (see below). 
    - Return HTTP 200 with a results array containing every row in the corresponding table. 
    - If the table is empty, return {"results": []}
    - Example:
```json
{
  "results": [
    { "semester_id": 8, "semester_name": "Spring", "year": 2027 },
    { "semester_id": 7, "semester_name": "Fall", "year": 2026 },
    ...
  ]
}
```

How to order the semester by season:
```SQL
SELECT semester_id, semester_name, year
FROM semesters
ORDER BY
    year DESC,
    CASE semester_name
        WHEN 'Winter' THEN 1
        WHEN 'Spring' THEN 2
        WHEN 'Summer' THEN 3
        WHEN 'Fall' THEN 4
    END DESC;
```

### Request Existing GE Categories:
- Request (GE categories that exist): `GET /ge_categories`  
    - Returns: All of the ge_categories that exist in the DB
    - No query parameters required. 
    - Returns all GE categories ordered by ge_category_code ascending.
    - Returns HTTP 200 with {"results": []} when the table is empty.
    - Example:
```json
{
  "results": [
    { "ge_category_id": 1, "ge_category_code": "1a", "ge_category": "American History" },
    { "ge_category_id": 2, "ge_category_code": "2b", "ge_category": "Math" },
    ...
  ]
}
```
