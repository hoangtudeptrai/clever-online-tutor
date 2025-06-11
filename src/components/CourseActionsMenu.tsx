
import React, { useState } from 'react';
import { MoreVertical, Edit, Users } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import EditCourseDialog from './EditCourseDialog';
import ManageStudentsDialog from './ManageStudentsDialog';

interface CourseActionsMenuProps {
  course: {
    id: string;
    title: string;
    description?: string;
    duration?: string;
    thumbnail?: string;
    students_count: number;
  };
}

const CourseActionsMenu: React.FC<CourseActionsMenuProps> = ({ course }) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showStudentsDialog, setShowStudentsDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white">
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowStudentsDialog(true)}>
            <Users className="h-4 w-4 mr-2" />
            Quản lý học sinh
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditCourseDialog
        course={course}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      <ManageStudentsDialog
        courseId={course.id}
        courseName={course.title}
        open={showStudentsDialog}
        onOpenChange={setShowStudentsDialog}
      />
    </>
  );
};

export default CourseActionsMenu;
