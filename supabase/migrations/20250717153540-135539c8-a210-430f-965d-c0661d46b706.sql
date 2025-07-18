-- Cập nhật trigger function với SECURITY DEFINER để bypass RLS
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
$$ LANGUAGE plpgsql SECURITY DEFINER;