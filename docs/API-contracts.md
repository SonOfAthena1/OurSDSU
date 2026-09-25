# OurSDSU API contracts

An API contract is a shared agreement about what the frontend sends to the backend and what the backend sends back. Agree on the names, types, and behavior here **before** implementing a search feature. The examples below describe the intended API; they are not routes that already work.

For each new filter, update the relevant contract together, then implement the React control, FastAPI parameter, database query, and displayed result using the same names and rules.

## Proposed first contract: Find a course and its sections

**Request:** `GET /courses?subject=CS&course_number=210`

| Query parameter | Type | Meaning |
| --- | --- | --- |
| `subject` | string, required | Exact subject code, such as `CS`. |
| `course_number` | integer, required | Exact course number, such as `210`. |

The backend searches the `courses` table by `subject_code` and `course_number` and includes matching rows from `sections`. Each course appears once in `results`; its sections go in the `sections` array. A course with no sections still appears with `"sections": []`. No matching course returns `"results": []`. If either required parameter is missing or `course_number` is not an integer, return HTTP 422 (FastAPI's normal query validation response).

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

Before coding this contract, have the frontend and backend teammates confirm the request URL, required parameters, response field names and types, and the empty-result behavior. Later filters can extend this contract one at a time.
