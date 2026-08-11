import { 
  BookOpen, 
  Users, 
  Calendar, 
  XCircle,
  Trophy
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

/**
 * Course Card Component - Grid View
 * Displays a course in card/grid format with actions
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
export default function CourseCard({
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
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant={getLevelVariant()}>
                {getLevelName()}
              </Badge>
              <Badge variant={course.isPublished ? 'success' : 'secondary'}>
                {course.isPublished ? 'Published' : 'Draft'}
              </Badge>
              {isEnrolled && enrollmentStatus === 'COMPLETED' && (
                <Badge className="bg-blue-100 text-black-900 border-black-200">
                  <Trophy className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
              {isEnrolled && enrollmentStatus === 'ACTIVE' && (
                <Badge variant="default">Enrolled</Badge>
              )}
            </div>
            <CardTitle className="text-lg line-clamp-2">
              {course.title}
            </CardTitle>
          </div>
        </div>
        <CardDescription className="line-clamp-2 mt-2">
          {course.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Progress bar for enrolled courses */}
        {isEnrolled && progress !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  enrollmentStatus === 'COMPLETED' ? 'bg-blue-600' : 'bg-brand-blue'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>{course.totalLessons || 0} lessons</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{course.totalEnrollments || 0} enrolled</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground col-span-2">
            <Calendar className="h-4 w-4" />
            <span>{new Date(course.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        {course.categoryId && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              Category: <span className="font-medium">{course.categoryId.name}</span>
            </p>
          </div>
        )}

        {course.languageId && (
          <div className="mt-2">
            <p className="text-xs text-muted-foreground">
              Language: <span className="font-medium">{getLanguageName()}</span>
            </p>
          </div>
        )}
      </CardContent>

      {/* Action Buttons - Match LessonCard pattern */}
      {showActions && (
        <CardFooter className="flex gap-2 pt-3 border-t">
          {onView && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onView(course)}
            >
              <BookOpen className="h-4 w-4 mr-1" />
              View
            </Button>
          )}

          {onEdit && !course.isPublished && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onEdit(course)}
            >
              Edit
            </Button>
          )}

          {onPublish && !course.isPublished && (
            <Button
              size="sm"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={() => onPublish(course)}
            >
              Publish
            </Button>
          )}

          {onUnpublish && course.isPublished && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onUnpublish(course)}
            >
              Unpublish
            </Button>
          )}

          {/* Only allow deleting draft courses without lessons or enrollments */}
          {onDelete && !course.isPublished && (course.totalLessons === 0 || !course.totalLessons) && (course.totalEnrollments === 0 || !course.totalEnrollments) && (
            <Button
              size="sm"
              className="flex-1 text-white bg-gray-400 hover:text-red-500 hover:bg-gray-800"
              onClick={() => onDelete(course)}
            >
              Delete
            </Button>
          )}

          {/* Refugee-specific actions */}
          {onEnroll && !isEnrolled && (
            <Button
              size="sm"
              className="flex-1 bg-brand-blue hover:bg-brand-blue-deep"
              onClick={() => onEnroll(course)}
            >
              Enroll
            </Button>
          )}

          {/* Only allow unenrolling from ACTIVE courses, not COMPLETED ones */}
          {onUnenroll && isEnrolled && enrollmentStatus === 'ACTIVE' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUnenroll(course)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Unenroll
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
