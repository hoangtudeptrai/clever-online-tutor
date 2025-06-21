import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Calendar, User, CheckCircle, Clock, XCircle, Edit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import CreateAssignmentDialog from '@/components/CreateAssignmentDialog';
import AssignmentActionsMenu from '@/components/AssignmentActionsMenu';
import { Assignment, AssignmentSubmission } from '@/types/assignment';
import { getApi } from '@/utils/api';
import { ASSIGNMENTS_API, COURSE_ENROLLMENTS_API } from '@/components/api-url';
import { toast } from 'react-hot-toast';
import { USERS_API } from '@/components/api-url';
import { formatDate } from '@/utils/format';

const Assignments = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assignmentSubmissions, setAssignmentSubmissions] = useState<AssignmentSubmission[]>([]);

  useEffect(() => {
    if (user?.role === 'teacher') {
      fetchAssignments();
    }
    if (user?.role === 'student') {
      fetchStudentAssignments();
    }
  }, [user?.role]);

  const fetchAssignments = async () => {
    try {
      const res = await getApi(ASSIGNMENTS_API.GET_ALL);
      if (res.data.length > 0) {
        const promises = res.data.map(async (item: Assignment) => {
          const creator = await getApi(USERS_API.GET_BY_ID(item.created_by));
          return {
            ...item,
            creator: creator.data.full_name
          };
        });

        const assignmentsWithCreators = await Promise.all(promises);
        setAssignments(assignmentsWithCreators);
      } else {
        setAssignments([]);
      }
    } catch (error) {
      console.log('error', error);
      toast.error('Lỗi khi lấy danh sách bài tập');
    }
  };

  const fetchStudentAssignments = async () => {
    try {
      // get the course this student has enrolled in => return course_id
      const course_enrolled = await getApi(COURSE_ENROLLMENTS_API.GET_BY_STUDENT_ID(user?.id));

      // get the assignments by this course_id  => return assignments
      const assignments_student = await Promise.all(course_enrolled.data.map(async (item: any) => {
        const res = await getApi(ASSIGNMENTS_API.GET_BY_COURSE_ID(item.course_id));
        return res.data;
      }));

      //merge all child elements into a single array
      const assignmentsArray = assignments_student.flat();
      setAssignments(assignmentsArray);
    } catch (error) {
      console.log('error', error);
    }
  };

  const getStatusBadge = (status: string) => {
    if (user?.role === 'teacher') {
      switch (status) {
        case 'active':
          return <Badge className="bg-blue-100 text-blue-800">Đang diễn ra</Badge>;
        case 'completed':
          return <Badge className="bg-green-100 text-green-800">Hoàn thành</Badge>;
        case 'draft':
          return <Badge className="bg-gray-100 text-gray-800">Nháp</Badge>;
        default:
          return <Badge>{status}</Badge>;
      }
    } else {
      switch (status) {
        case 'submitted':
          return <Badge className="bg-green-100 text-green-800">Đã nộp</Badge>;
        case 'pending':
          return <Badge className="bg-yellow-100 text-yellow-800">Chưa nộp</Badge>;
        case 'late':
          return <Badge className="bg-red-100 text-red-800">Nộp muộn</Badge>;
        default:
          return <Badge>{status}</Badge>;
      }
    }
  };

  const getStatusIcon = (status: string) => {
    if (user?.role === 'teacher') {
      switch (status) {
        case 'completed':
          return <CheckCircle className="h-5 w-5 text-green-600" />;
        case 'active':
          return <Clock className="h-5 w-5 text-blue-600" />;
        case 'draft':
          return <XCircle className="h-5 w-5 text-gray-600" />;
        default:
          return <Clock className="h-5 w-5" />;
      }
    } else {
      switch (status) {
        case 'submitted':
          return <CheckCircle className="h-5 w-5 text-green-600" />;
        case 'pending':
          return <Clock className="h-5 w-5 text-yellow-600" />;
        case 'late':
          return <XCircle className="h-5 w-5 text-red-600" />;
        default:
          return <Clock className="h-5 w-5" />;
      }
    }
  };

  // const assignments = user?.role === 'teacher' ? teacherAssignments : studentAssignments;

  const filteredAssignments = assignments.filter(assignment =>
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.course_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user?.role === 'teacher' ? 'Quản lý bài tập' : 'Bài tập của tôi'}
            </h1>
            <p className="text-gray-600 mt-2">
              {user?.role === 'teacher'
                ? 'Tạo và quản lý bài tập cho học sinh'
                : 'Theo dõi và nộp bài tập được giao'
              }
            </p>
          </div>
          {user?.role === 'teacher' && <CreateAssignmentDialog onSuccess={fetchAssignments} courseId={''} />}
        </div>

        {/* Search and Filter */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm bài tập..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Lọc
          </Button>
        </div>

        {/* Assignments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssignments.map((assignment) => (
            <Card key={assignment.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(assignment.status)}
                    <CardTitle className="text-lg">{assignment.title}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(assignment.status)}
                    {user?.role === 'teacher' && (
                      <AssignmentActionsMenu assignment={assignment} onSuccess={fetchAssignments} courseId={''} />
                    )}
                  </div>
                </div>
                <CardDescription className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{assignment.creator}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{assignment.description}</p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      Hạn nộp:
                    </span>
                    <span className="font-medium">{formatDate(assignment.due_date)}</span>
                  </div>

                  {user?.role === 'teacher' ? (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Đã nộp:</span>
                      <span className="font-medium">
                        {(assignment as Assignment).submitted}/{(assignment as Assignment).total}
                      </span>
                    </div>
                  ) : (
                    <>
                      {/* {assignmentSubmission.submitted_at && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Ngày nộp:</span>
                          <span className="font-medium">{assignmentSubmission.submitted_at}</span>
                        </div>
                      )}
                      {assignmentSubmission.grade && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Điểm:</span>
                          <span className="font-medium text-blue-600">{assignmentSubmission.grade}/10</span>
                        </div>
                      )} */}
                    </>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <Link to={`/dashboard/assignments/${assignment.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      {user?.role === 'teacher' ? 'Xem chi tiết' :
                        assignment.status === 'pending' ? 'Nộp bài' : 'Xem chi tiết'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Assignments;
