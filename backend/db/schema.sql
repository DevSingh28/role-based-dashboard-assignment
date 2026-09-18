-- ============================================================
-- 1. USERS
-- ============================================================

CREATE TABLE users (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(225) NOT NULL,
    role VARCHAR(30) NOT NULL,
    region VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 2. STUDENTS
-- ============================================================

CREATE TABLE students (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(20) NOT NULL,
    joined_on DATE NOT NULL
);


-- ============================================================
-- 3. COURSES
-- ============================================================

CREATE TABLE courses (
    id VARCHAR(10) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    level VARCHAR(50) NOT NULL,
    instructor VARCHAR(255) NOT NULL,
    duration_weeks INTEGER NOT NULL
);


-- ============================================================
-- 4. ENROLLMENTS
-- ============================================================

CREATE TABLE enrollments (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id VARCHAR(10) NOT NULL,
    course_id VARCHAR(10) NOT NULL,
    enrolled_on DATE NOT NULL,
    completion_status VARCHAR(30) NOT NULL,
    grade VARCHAR(5),
    rating INTEGER NOT NULL,
    fee_paid NUMERIC(10, 2) NOT NULL,

    UNIQUE (student_id, course_id)
);


-- ============================================================
-- 5. FOREIGN KEY CONSTRAINTS
-- ============================================================

ALTER TABLE enrollments
ADD CONSTRAINT fk_enrollments_student
FOREIGN KEY (student_id)
REFERENCES students(id);


ALTER TABLE enrollments
ADD CONSTRAINT fk_enrollments_course
FOREIGN KEY (course_id)
REFERENCES courses(id);


-- ============================================================
-- 6. INDEXES
-- ============================================================

CREATE INDEX idx_students_region
ON students(region);


CREATE INDEX idx_enrollments_student_id
ON enrollments(student_id);


CREATE INDEX idx_enrollments_course_id
ON enrollments(course_id);