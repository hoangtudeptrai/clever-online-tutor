import { USERS_API } from "@/components/api-url";
import DashboardLayout from "@/components/DashboardLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Student } from "@/types/auth";
import { getApi } from "@/utils/api";
import { formatDate } from "@/utils/format";
import { ArrowLeft, Badge, Calendar, Mail, MapPin, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Link, useParams } from "react-router-dom";

const StudentDetail = () => {
    const { studentId } = useParams();
    const [student, setStudent] = useState<Student>(null);

    const achievements = [
        { title: 'Hoàn thành khóa học đầu tiên', date: '2025-03-15', icon: '🎓' },
        { title: 'Đạt điểm 9+ trong 5 bài tập liên tiếp', date: '2025-04-01', icon: '⭐' },
        { title: 'Nộp bài đúng hạn 100%', date: '2025-04-10', icon: '⏰' },
        { title: 'Top 3 học sinh xuất sắc tháng', date: '2025-04-12', icon: '🏆' }
    ];

    const enrolledCourses = [
        { name: 'Lập trình Web cơ bản', progress: 85, status: 'active' },
        { name: 'React Nâng cao', progress: 45, status: 'active' },
        { name: 'Node.js Backend', progress: 100, status: 'completed' }
    ];

    const learningStats = {
        totalCourses: 3,
        completedCourses: 1,
        totalAssignments: 25,
        completedAssignments: 21,
        averageGrade: 8.5,
        studyHours: 120
    };

    useEffect(() => {
        console.log('studentId', studentId);
        fetchStudent();

    }, []);

    const fetchStudent = async () => {
        try {
            const res = await getApi(`${USERS_API.GET_BY_ID(studentId)}`);
            console.log('res', res);
            if (res.data) {
                setStudent(res.data);
            }
        } catch (error) {
            console.error('Error fetching student:', error);
            toast.error('Lỗi khi tải thông tin học viên');
        }
    }

    if (!student) {
        return (
            <DashboardLayout>
                <p>Đang tải thông tin học viên...</p>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="flex items-center space-x-4">
                <Link to="/dashboard/students">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900">Chi tiết học viên</h1>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* Profile Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin học viên</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-6 mb-6">
                                <div className="relative">
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage src="/placeholder.svg" alt={student.full_name} />
                                        <AvatarFallback className="text-xl">
                                            {student.full_name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold">{student.full_name}</h3>
                                    <p className="text-gray-600">Học sinh</p>
                                    <p className="text-sm text-gray-500">Mã SV: {student.id}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Họ và tên</Label>
                                    <div className="flex items-center space-x-2">
                                        <span>{student.full_name}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="flex items-center space-x-2">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                        <span>{student.email}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Số điện thoại</Label>
                                    <div className="flex items-center space-x-2">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                        <span>{student.phone_number}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        <span>{formatDate(student.date_of_birth)}</span>
                                    </div>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="address">Địa chỉ</Label>
                                    <div className="flex items-center space-x-2">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        <span>{student.address}</span>
                                    </div>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="bio">Giới thiệu bản thân</Label>
                                    <p className="text-gray-700">{student.bio}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Tiến độ học tập</CardTitle>
                            <CardDescription>Các khóa học đang tham gia</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {enrolledCourses.map((course, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">{course.name}</span>
                                            <div className="flex items-center space-x-2">
                                                <Badge
                                                    className={
                                                        course.status === 'completed'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-blue-100 text-blue-800'
                                                    }
                                                >
                                                    {course.status === 'completed' ? 'Hoàn thành' : 'Đang học'}
                                                </Badge>
                                                <span className="text-sm font-medium">{course.progress}%</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${course.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                                                    }`}
                                                style={{ width: `${course.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thống kê học tập</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Khóa học tham gia:</span>
                                    <span className="font-medium">{learningStats.totalCourses}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Khóa học hoàn thành:</span>
                                    <span className="font-medium">{learningStats.completedCourses}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Bài tập đã nộp:</span>
                                    <span className="font-medium">
                                        {learningStats.completedAssignments}/{learningStats.totalAssignments}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Điểm trung bình:</span>
                                    <span className="font-medium text-blue-600">{learningStats.averageGrade}/10</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Giờ học tích lũy:</span>
                                    <span className="font-medium">{learningStats.studyHours}h</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Achievements */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thành tích</CardTitle>
                            <CardDescription>Các mốc đáng chú ý</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {achievements.map((achievement, index) => (
                                    <div key={index} className="flex items-start space-x-3 p-2 bg-gray-50 rounded-lg">
                                        <span className="text-xl">{achievement.icon}</span>
                                        <div>
                                            <p className="font-medium text-sm">{achievement.title}</p>
                                            <p className="text-xs text-gray-500">{achievement.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </DashboardLayout>
    )
}

export default StudentDetail;