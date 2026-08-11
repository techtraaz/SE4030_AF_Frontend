import { 
  BookOpen, 
  Users, 
  Calendar, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  Trophy
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/**
 * Course List Item Component - List View
 * Displays a course in list/row format with actions
 * 
 * @param {Object} course - Course object
 * @param {Function} onView - View course callback
 * @param {Function} onEdit - Edit course callback (optional)
 * @param {Function} onPublish - Publish course callback (optional, admin only)
 * @param {Function} onUnpublish - Unpublish course callback (optional, admin only)
 * @param {Function} onDelete - Delete course callback (optional)
 * @param {Function} onEnroll - Enroll in course callback (optional, for refugees)
 * @param {Function} onUnenroll - Unenroll from course callback (optional, for refugees)
 * @param {boolean} isEnrolled - Whether user is enrolled (for refugees)
 * @param {number} progress - Enrollment progress (0-100, for refugees)
 * @param {string} enrollmentStatus - Enrollment status (ACTIVE, COMPLETED)
 * @param {boolean} showActions - Whether to show action buttons (default: true)
 */
export default function CourseListItem({
  course,
  onView,
  onEdit,
  onPublish,
  onUnpublish,
  onDelete,
  onEnroll,
  onUnenroll,
  isEnrolled = false,
  progress = 0,
  enrollmentStatus = 'ACTIVE',
  showActions = true
}) {
  const getLevelVariant = () => {
    const level = course.levelId || course.level
    if (typeof level === 'object' && level?.displayOrder) {
      if (level.displayOrder === 1) return 'success'
      if (level.displayOrder === 2) return 'warning'
      if (level.displayOrder === 3) return 'destructive'
    }
    return 'default'
  }

  const getLevelName = () => {
    const level = course.levelId || course.level
    if (typeof level === 'object' && level?.name) {
      return level.name
    }
    if (typeof level === 'string' && level !== 'all') {
      return level
    }
    return 'Unknown'
  }

  const getLanguageName = () => {
    const language = course.languageId || course.language
    if (typeof language === 'object' && language?.name) {
      return language.name
    }
    if (typeof language === 'string') {
      return language
    }
    return 'English'
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Course Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant={getLevelVariant()}>
                {getLevelName()}
              </Badge>
              <Badge variant={course.isPublished ? 'success' : 'secondary'}>
                {course.isPublished ? 'Published' : 'Draft'}
              </Badge>
              {isEnrolled && enrollmentStatus === 'COMPLETED' && (
                <Badge className="bg-blue-100 text-blue-900 border-blue-200">
                  <Trophy className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
              {isEnrolled && enrollmentStatus === 'ACTIVE' && (
                <Badge variant="default">Enrolled</Badge>
              )}
              {course.categoryId && (
                <span className="text-xs text-muted-foreground">
                  {course.categoryId.name}
                </span>
              )}
              {course.languageId && (
                <span className="text-xs text-muted-foreground">
                  • {getLanguageName()}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-lg mb-1 truncate">{course.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
              {course.description}
            </p>

            {/* Progress bar for enrolled courses */}
            {isEnrolled && progress !== undefined && (
              <div className="mb-3 max-w-md">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      enrollmentStatus === 'COMPLETED' ? 'bg-blue-600' : 'bg-primary'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{course.totalLessons || 0} lessons</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{course.totalEnrollments || 0} enrolled</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(course.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex items-center gap-2">
              {onView && (
                <Button variant="outline" size="sm" onClick={() => onView(course)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
              )}
              {onEdit && !course.isPublished && (
                <Button variant="outline" size="sm" onClick={() => onEdit(course)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              {onPublish && !course.isPublished && (
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => onPublish(course)}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Publish
                </Button>
              )}
              {onUnpublish && course.isPublished && (
                <Button variant="outline" size="sm" onClick={() => onUnpublish(course)}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Unpublish
                </Button>
              )}
              {onEnroll && !isEnrolled && (
                <Button variant="default" size="sm" onClick={() => onEnroll(course)}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Enroll
                </Button>
              )}
              {(onDelete || onUnenroll) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {/* Only allow unenrolling from ACTIVE courses, not COMPLETED ones */}
                    {onUnenroll && isEnrolled && enrollmentStatus === 'ACTIVE' && (
                      <DropdownMenuItem onClick={() => onUnenroll(course)} className="text-destructive">
                        <XCircle className="h-4 w-4 mr-2" />
                        Unenroll
                      </DropdownMenuItem>
                    )}
                    {/* Only allow deleting draft courses without lessons or enrollments */}
                    {onDelete && !course.isPublished && (course.totalLessons === 0 || !course.totalLessons) && (course.totalEnrollments === 0 || !course.totalEnrollments) && (
                      <>
                        {onUnenroll && isEnrolled && enrollmentStatus === 'ACTIVE' && <DropdownMenuSeparator />}
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => onDelete(course._id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
