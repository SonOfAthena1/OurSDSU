# OurSDSU API contracts

An API contract is a shared agreement about what the frontend sends to the backend and what the backend sends back. Agree on the names, types, and behavior here **before** implementing a search feature. The examples below describe the intended API; they are not routes that already work.

For each new filter, update the relevant contract together, then implement the React control, FastAPI parameter, database query, and displayed result using the same names and rules.

## Proposed first contract: Find a course and its sections in selected semesters

Every course search must include at least one selected semester. A semester means a specific season and year, such as Fall 2026 or Spring 2027.

**Request (one semester):** `GET /courses?subject=CS&course_number=210&semester_id=3`

**Request (multiple semesters):** `GET /courses?subject=CS&course_number=210&semester_id=3&semester_id=4`

For these examples, semester ID `3` represents Fall 2026 and ID `4` represents Spring 2027. These IDs are illustrative; the frontend must use the actual IDs from the `semesters` table.

| Query parameter | Type | Meaning |
| --- | --- | --- |
| `subject` | string, required | Exact subject code, such as `CS`. |
| `course_number` | integer, required | Exact course number, such as `210`. |
| `semester_id` | list of positive integers, required; at least one | IDs of selected semesters. Repeat the query parameter for multiple selections, as above; do not use a comma-separated string. |

The backend searches the `courses` table by `subject_code` and `course_number`, then includes only sections whose `semester_offered_id` is one of the selected semester IDs. Multiple selections mean **any selected semester**: selecting Fall 2026 and Spring 2027 includes sections from either semester, without requiring a course to be offered in both.

Each course appears once in `results`; all its matching sections go in its `sections` array. Sections from unselected semesters are excluded. A course with no sections in any selected semester is omitted. If no courses have matching sections, return HTTP 200 with `"results": []`.

**Validation:** Return HTTP 422 if `subject` or `course_number` is missing, `course_number` is not an integer, or no semester IDs are supplied. Also return HTTP 422 for an empty, non-integer, non-positive, or nonexistent semester ID. Treat duplicate semester IDs as one selection. The frontend should prevent submitting a search with no semesters selected, and the backend must enforce the same requirement independently. Missing semesters must never default to searching all semesters.

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

`course_number`, IDs, enrollment counts, and units are JSON numbers. Times use `HH:MM:SS` strings. In the database, `sections.meeting_days` is a bitmask: Mon = 1, Tue = 2, Wed = 4, Thu = 8, Fri = 16, Sat = 32, and Sun = 64. The backend decodes that number into the `meeting_days` array of weekday strings in the response, ordered Mon through Sun; for example, a stored value of `10` becomes `["Tue", "Thu"]`. React displays those strings and does not need to decode the bitmask. `semester_id` in the response comes from `sections.semester_offered_id` in the database. The backend gets `semester_name` and `year` from `semesters`, and `instructor_name` from `instructors`.

Before coding this contract, have the frontend and backend teammates confirm the request URL, required parameters, response field names and types, and the empty-result behavior. Later filters can extend this contract one at a time, while keeping at least one semester required for every course search.
