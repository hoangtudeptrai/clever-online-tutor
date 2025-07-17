
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookOpen, Users, ClipboardList, GraduationCap, FileText } from 'lucide-react';

const AdminDetailedStats = () => {
  // Fetch giáo viên và khóa học của họ
  const { data: tutorCourses, isLoading: tutorCoursesLoading } = useQuery({
    queryKey: ['tutor-courses'],
    queryFn: async () => {
      const { data: tutors } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, email')
        .eq('role', 'tutor');

      if (!tutors) return [];

      const tutorsWithCourses = await Promise.all(
        tutors.map(async (tutor) => {
          const { data: courses } = await supabase
            .from('courses')
            .select('id, title, status, students_count, created_at')
            .eq('instructor_id', tutor.id);

          return {
            ...tutor,
            courses: courses || []
          };
        })
      );

      return tutorsWithCourses;
    }
  });

  // Fetch khóa học và bài tập
  const { data: courseAssignments, isLoading: courseAssignmentsLoading } = useQuery({
    queryKey: ['course-assignments'],
    queryFn: async () => {
      const { data: courses } = await supabase
        .from('courses')
        .select(`
          id, 
          title, 
          status,
          profiles!courses_instructor_id_fkey(full_name, avatar_url)
        `);

      if (!courses) return [];

      const coursesWithAssignments = await Promise.all(
        courses.map(async (course) => {
          const { data: assignments } = await supabase
            .from('assignments')
            .select('id, title, status, created_at, due_date')
            .eq('course_id', course.id);

          return {
            ...course,
            assignments: assignments || []
          };
        })
      );

      return coursesWithAssignments;
    }
  });

  // Fetch bài tập và thông tin khóa học
  const { data: assignmentDetails, isLoading: assignmentDetailsLoading } = useQuery({
    queryKey: ['assignment-details'],
    queryFn: async () => {
      const { data: assignments } = await supabase
        .from('assignments')
        .select(`
          id,
          title,
          status,
          due_date,
          created_at,
          courses!assignments_course_id_fkey(
            title,
            profiles!courses_instructor_id_fkey(full_name, avatar_url)
          )
        `);

      if (!assignments) return [];

      const assignmentsWithStats = await Promise.all(
        assignments.map(async (assignment) => {
          const { count: submissionsCount } = await supabase
            .from('assignment_submissions')
            .select('*', { count: 'exact', head: true })
            .eq('assignment_id', assignment.id);

          const { count: gradedCount } = await supabase
            .from('assignment_submissions')
            .select('*', { count: 'exact', head: true })
            .eq('assignment_id', assignment.id)
            .eq('status', 'graded');

          return {
            ...assignment,
            submissionsCount: submissionsCount || 0,
            gradedCount: gradedCount || 0
          };
        })
      );

      return assignmentsWithStats;
    }
  });

  if (tutorCoursesLoading || courseAssignmentsLoading || assignmentDetailsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Giáo viên và khóa học */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            <span>Giáo viên và khóa học quản lý</span>
          </CardTitle>
          <CardDescription>
            Thống kê chi tiết về các khóa học được quản lý bởi từng giáo viên
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {tutorCourses?.map((tutor) => (
              <div key={tutor.id} className="border rounded-lg p-4">
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={tutor.avatar_url || ''} alt={tutor.full_name} />
                    <AvatarFallback>
                      {tutor.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{tutor.full_name}</h3>
                    <p className="text-sm text-gray-600">{tutor.email}</p>
                    <Badge variant="outline" className="mt-1">
                      {tutor.courses.length} khóa học
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tutor.courses.map((course) => (
                    <div key={course.id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{course.title}</h4>
                        <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                          {course.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{course.students_count || 0} học sinh</span>
                        </div>
                        <div className="mt-1">
                          Tạo: {new Date(course.created_at).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {tutor.courses.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    Giáo viên này chưa tạo khóa học nào
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Khóa học và bài tập */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-green-600" />
            <span>Khóa học và bài tập</span>
          </CardTitle>
          <CardDescription>
            Thống kê chi tiết về bài tập trong từng khóa học
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {courseAssignments?.map((course) => (
              <div key={course.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{course.title}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={(course.profiles as any)?.avatar_url || ''} />
                          <AvatarFallback>
                            {(course.profiles as any)?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>Giáo viên: {(course.profiles as any)?.full_name}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                    {course.assignments.length} bài tập
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {course.assignments.map((assignment) => (
                    <div key={assignment.id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{assignment.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {assignment.status || 'draft'}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>Tạo: {new Date(assignment.created_at).toLocaleDateString('vi-VN')}</div>
                        {assignment.due_date && (
                          <div>Hạn: {new Date(assignment.due_date).toLocaleDateString('vi-VN')}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {course.assignments.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    Khóa học này chưa có bài tập nào
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bài tập và thông tin chi tiết */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ClipboardList className="h-6 w-6 text-purple-600" />
            <span>Thống kê bài tập chi tiết</span>
          </CardTitle>
          <CardDescription>
            Thông tin chi tiết về từng bài tập và tỷ lệ hoàn thành
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assignmentDetails?.map((assignment) => (
              <div key={assignment.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{assignment.title}</h3>
                    <div className="text-sm text-gray-600 mt-1">
                      <div>Khóa học: {(assignment.courses as any)?.title}</div>
                      <div>Giáo viên: {(assignment.courses as any)?.profiles?.full_name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={assignment.status === 'published' ? 'default' : 'secondary'}>
                      {assignment.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-blue-600 font-medium">Tổng bài nộp</div>
                    <div className="text-2xl font-bold text-blue-700">{assignment.submissionsCount}</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-green-600 font-medium">Đã chấm điểm</div>
                    <div className="text-2xl font-bold text-green-700">{assignment.gradedCount}</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="text-yellow-600 font-medium">Tỷ lệ chấm</div>
                    <div className="text-2xl font-bold text-yellow-700">
                      {assignment.submissionsCount > 0 
                        ? Math.round((assignment.gradedCount / assignment.submissionsCount) * 100) 
                        : 0}%
                    </div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-purple-600 font-medium">Ngày tạo</div>
                    <div className="text-sm font-bold text-purple-700">
                      {new Date(assignment.created_at).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
                
                {assignment.due_date && (
                  <div className="mt-3 text-sm text-gray-600">
                    <span className="font-medium">Hạn nộp:</span> {new Date(assignment.due_date).toLocaleDateString('vi-VN')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDetailedStats;
