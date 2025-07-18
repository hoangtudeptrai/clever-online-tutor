
-- Tạo trigger để tự động tạo thông báo khi có bài tập mới được tạo
CREATE OR REPLACE FUNCTION notify_students_new_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Chỉ tạo thông báo khi assignment được published
  IF NEW.assignment_status = 'published' AND (OLD IS NULL OR OLD.assignment_status != 'published') THEN
    -- Tạo thông báo cho tất cả học sinh trong khóa học
    INSERT INTO notifications (user_id, type, title, content, related_id)
    SELECT 
      ce.student_id,
      'assignment_created',
      'Bài tập mới: ' || NEW.title,
      'Giáo viên đã giao bài tập mới trong khóa học. Hạn nộp: ' || 
      CASE 
        WHEN NEW.due_date IS NOT NULL 
        THEN to_char(NEW.due_date, 'DD/MM/YYYY HH24:MI')
        ELSE 'Không giới hạn'
      END,
      NEW.id
    FROM course_enrollments ce
    WHERE ce.course_id = NEW.course_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tạo trigger
DROP TRIGGER IF EXISTS trigger_notify_students_new_assignment ON assignments;
CREATE TRIGGER trigger_notify_students_new_assignment
  AFTER INSERT OR UPDATE ON assignments
  FOR EACH ROW
  EXECUTE FUNCTION notify_students_new_assignment();

-- Cập nhật hàm useStudentActivities để bao gồm cả thông báo assignment due soon
-- Thêm view để dễ dàng lấy upcoming assignments
CREATE OR REPLACE VIEW upcoming_assignments_view AS
SELECT 
  a.id,
  a.title,
  a.due_date,
  a.course_id,
  c.title as course_title,
  ce.student_id,
  CASE 
    WHEN a.due_date <= NOW() + INTERVAL '1 day' THEN 'urgent'
    WHEN a.due_date <= NOW() + INTERVAL '3 days' THEN 'soon'
    ELSE 'normal'
  END as urgency_status
FROM assignments a
JOIN courses c ON a.course_id = c.id
JOIN course_enrollments ce ON c.id = ce.course_id
WHERE a.assignment_status = 'published'
  AND a.due_date > NOW()
  AND NOT EXISTS (
    SELECT 1 FROM assignment_submissions asub 
    WHERE asub.assignment_id = a.id 
    AND asub.student_id = ce.student_id
  );
