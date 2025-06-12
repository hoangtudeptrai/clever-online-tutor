DO $$ 
BEGIN
    -- Kiểm tra và thêm foreign key cho student_id nếu chưa tồn tại
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'course_enrollments_student_id_fkey'
    ) THEN
        ALTER TABLE course_enrollments
        ADD CONSTRAINT course_enrollments_student_id_fkey 
        FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;

    -- Kiểm tra và thêm foreign key cho course_id nếu chưa tồn tại
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'course_enrollments_course_id_fkey'
    ) THEN
        ALTER TABLE course_enrollments
        ADD CONSTRAINT course_enrollments_course_id_fkey 
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Tạo các indexes nếu chưa tồn tại (CREATE INDEX IF NOT EXISTS đã xử lý việc kiểm tra)
CREATE INDEX IF NOT EXISTS idx_course_enrollments_student_id ON course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id); 