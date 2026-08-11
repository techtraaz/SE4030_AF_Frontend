import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Loader2, 
  BookOpen, 
  Headphones, 
  BookMarked, 
  Video, 
  ArrowLeft,
  Clock,
  TrendingUp,
  Volume2,
  VolumeX,
  Play,
  Pause,
  CheckCircle,
  FileQuestion
} from 'lucide-react'
import { toastService } from '@/services/toastService'
import lessonService from '@/services/lesson/lessonService'
import quizService from '@/services/quiz/quizService'
import quizAttemptService from '@/services/quiz/quizAttemptService'
import { markLessonComplete } from '@/services/lesson/lessonProgressService'
import QuizCardWithProgress from '@/components/shared/quiz/QuizCardWithProgress'
import useAuth from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

/**
 * LessonPlayer - Interactive lesson viewing interface for refugees
 * Displays all sections: Reading, Listening, Vocabulary, Video, Quizzes
 * @param {string} lessonId - Lesson ID (for inline mode)
 * @param {boolean} inline - Whether displayed inline (no URL routing)
 * @param {function} onBack - Callback when back button is clicked (inline mode)
 */
const LessonPlayer = ({ lessonId: propLessonId, inline = false, onBack }) => {
  const { lessonId: paramLessonId } = useParams()
  const lessonId = propLessonId || paramLessonId
  const navigate = useNavigate()
  const { user } = useAuth()
  const [lesson, setLesson] = useState(null)
  const [quizzes, setQuizzes] = useState([])
  const [quizCompletionStatus, setQuizCompletionStatus] = useState({})
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)
  const [activeSection, setActiveSection] = useState('reading')
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [audioSpeed, setAudioSpeed] = useState('normal') // 'normal' | 'slow'

  useEffect(() => {
    if (lessonId) {
      fetchLesson()
      fetchQuizzes()
    }
  }, [lessonId])

  // Refresh quiz completion status when page regains focus (after taking a quiz)
  useEffect(() => {
    const handleFocus = () => {
      if (quizzes.length > 0 && user?.role === 'REFUGEE') {
        checkQuizCompletion(quizzes)
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [quizzes, user])

  const fetchLesson = async () => {
    try {
      setLoading(true)
      const data = await lessonService.getLessonById(lessonId)
      setLesson(data)
    } catch (error) {
      toastService.error('Failed to load lesson')
      if (inline && onBack) {
        onBack()
      } else {
        navigate('/dashboard/my-courses')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchQuizzes = async () => {
    try {
      const quizzesData = await quizService.getAllQuizzes({ lessonId, isPublished: true })
      setQuizzes(quizzesData || [])
      
      // Check quiz completion status for refugees
      if (user?.role === 'REFUGEE' && user?._id && quizzesData?.length > 0) {
        await checkQuizCompletion(quizzesData)
      }
    } catch (error) {
      console.error('Failed to load quizzes:', error)
      setQuizzes([])
    }
  }

  const checkQuizCompletion = async (quizzesData) => {
    try {
      const refugeeId = user._id || user.id
      const completionStatus = {}
      
      // Check each quiz for passed attempts
      for (const quiz of quizzesData) {
        try {
          const attempts = await quizAttemptService.getUserQuizAttempts(refugeeId, quiz._id)
          const hasPassed = attempts.some(attempt => attempt.passed === true)
          completionStatus[quiz._id] = hasPassed
        } catch (error) {
          console.error(`Failed to check completion for quiz ${quiz._id}:`, error)
          completionStatus[quiz._id] = false
        }
      }
      
      setQuizCompletionStatus(completionStatus)
    } catch (error) {
      console.error('Failed to check quiz completion:', error)
    }
  }

  const handleBack = () => {
    if (inline && onBack) {
      onBack()
    } else {
      // Navigate back to course detail page
      if (lesson?.courseId?._id) {
        navigate(`/dashboard/courses/${lesson.courseId._id}`)
      } else if (lesson?.courseId) {
        navigate(`/dashboard/courses/${lesson.courseId}`)
      } else {
        navigate('/dashboard/my-courses')
      }
    }
  }

  const handleTakeQuiz = (quiz) => {
    navigate(`/dashboard/quiz/${quiz._id}`)
  }

  const handleComplete = async () => {
    if (!lesson?.courseId?._id && !lesson?.courseId) {
      toastService.error('Cannot mark lesson complete: missing course information')
      return
    }

    // Check if all quizzes are completed
    if (quizzes.length > 0 && !areAllQuizzesCompleted()) {
      const incompletedCount = quizzes.filter(quiz => !quizCompletionStatus[quiz._id]).length
      toastService.error(
        `Please complete all ${quizzes.length} quiz${quizzes.length > 1 ? 'es' : ''} before marking this lesson as complete. ` +
        `${incompletedCount} quiz${incompletedCount > 1 ? 'es' : ''} remaining.`
      )
      return
    }

    const courseId = lesson.courseId._id || lesson.courseId

    try {
      setMarking(true)
      await markLessonComplete(courseId, lessonId)
      toastService.success('Lesson marked as complete!')
      handleBack()
    } catch (error) {
      console.error('Failed to mark lesson complete:', error)
      toastService.error('Failed to mark lesson as complete')
    } finally {
      setMarking(false)
    }
  }

  const areAllQuizzesCompleted = () => {
    if (quizzes.length === 0) return true
    return quizzes.every(quiz => quizCompletionStatus[quiz._id] === true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-brand-gray">Lesson not found</p>
        <Button onClick={handleBack} className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  const difficultyColors = {
    beginner: 'bg-blue-100 text-blue-800',
    intermediate: 'bg-brand-blue/10 text-brand-blue-deep',
    advanced: 'bg-red-100 text-red-800',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-brand-navy">
                  {lesson.title}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1 text-sm text-brand-gray">
                    <Clock className="h-4 w-4" />
                    <span>{lesson.estimatedMinutes} min</span>
                  </div>
                  <Badge className={cn('text-xs', difficultyColors[lesson.difficulty])}>
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {lesson.difficulty}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Button 
                onClick={handleComplete} 
                disabled={marking || (quizzes.length > 0 && !areAllQuizzesCompleted())}
              >
                {marking ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Marking Complete...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Complete
                  </>
                )}
              </Button>
              {quizzes.length > 0 && !areAllQuizzesCompleted() && (
                <p className="text-xs text-red-600 max-w-[200px] text-right">
                  Complete all {quizzes.length} quiz{quizzes.length > 1 ? 'es' : ''} to finish this lesson
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {lesson.description && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <p className="text-brand-gray">{lesson.description}</p>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeSection} onValueChange={setActiveSection}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="reading" disabled={!lesson.reading}>
              <BookOpen className="h-4 w-4 mr-2" />
              Reading
            </TabsTrigger>
            <TabsTrigger value="listening" disabled={!lesson.listening}>
              <Headphones className="h-4 w-4 mr-2" />
              Listening
            </TabsTrigger>
            <TabsTrigger value="vocabulary" disabled={!lesson.vocabulary}>
              <BookMarked className="h-4 w-4 mr-2" />
              Vocabulary
            </TabsTrigger>
            <TabsTrigger value="video" disabled={!lesson.video}>
              <Video className="h-4 w-4 mr-2" />
              Video
            </TabsTrigger>
            <TabsTrigger value="quizzes" disabled={quizzes.length === 0}>
              <FileQuestion className="h-4 w-4 mr-2" />
              Quizzes {quizzes.length > 0 && `(${quizzes.length})`}
            </TabsTrigger>
          </TabsList>

          {/* Reading Section */}
          <TabsContent value="reading">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-brand-blue" />
                  Reading Exercise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {lesson.reading ? (
                  <>
                    <div className="prose max-w-none">
                      <p className="text-base leading-relaxed whitespace-pre-wrap">
                        {lesson.reading.content}
                      </p>
                    </div>

                    {lesson.reading.highlightWords && lesson.reading.highlightWords.length > 0 && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-semibold text-brand-navy mb-3">Key Words</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {lesson.reading.highlightWords.map((item, index) => (
                            <div key={index} className="p-3 bg-white rounded border">
                              <p className="font-semibold text-brand-navy">{item.word}</p>
                              <p className="text-sm text-brand-gray mt-1">{item.meaning}</p>
                              {item.translation && (
                                <p className="text-sm text-brand-blue mt-1">{item.translation}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-brand-gray text-center py-8">Reading section not available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Listening Section */}
          <TabsContent value="listening">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Headphones className="h-5 w-5 text-brand-blue" />
                  Listening Exercise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {lesson.listening ? (
                  <>
                    {/* Audio Player */}
                    <div className="p-6 bg-gradient-to-r from-brand-blue/10 to-brand-blue-light/10 rounded-lg">
                      <div className="flex items-center justify-center gap-4 mb-4">
                        <Button 
                          size="lg" 
                          className="rounded-full w-16 h-16"
                          onClick={() => setAudioPlaying(!audioPlaying)}
                        >
                          {audioPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                        </Button>
                      </div>
                      
                      <audio 
                        src={audioSpeed === 'slow' && lesson.listening.slowAudioUrl 
                          ? lesson.listening.slowAudioUrl 
                          : lesson.listening.audioUrl
                        }
                        controls 
                        className="w-full"
                      />

                      {lesson.listening.slowAudioUrl && (
                        <div className="flex items-center justify-center gap-2 mt-4">
                          <Button
                            size="sm"
                            variant={audioSpeed === 'normal' ? 'default' : 'outline'}
                            onClick={() => setAudioSpeed('normal')}
                          >
                            <Volume2 className="h-4 w-4 mr-1" />
                            Normal Speed
                          </Button>
                          <Button
                            size="sm"
                            variant={audioSpeed === 'slow' ? 'default' : 'outline'}
                            onClick={() => setAudioSpeed('slow')}
                          >
                            <VolumeX className="h-4 w-4 mr-1" />
                            Slow Speed
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Transcript */}
                    <div>
                      <h3 className="font-semibold text-brand-navy mb-3">Transcript</h3>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-base leading-relaxed whitespace-pre-wrap">
                          {lesson.listening.transcript}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-brand-gray text-center py-8">Listening section not available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vocabulary Section */}
          <TabsContent value="vocabulary">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookMarked className="h-5 w-5 text-brand-blue" />
                  Vocabulary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lesson.vocabulary && lesson.vocabulary.words && lesson.vocabulary.words.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lesson.vocabulary.words.map((word, index) => (
                      <Card key={index} className="border-2 hover:border-brand-blue transition-colors">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-xl font-bold text-brand-navy">{word.word}</p>
                              <p className="text-sm text-brand-gray mt-1">{word.meaning}</p>
                            </div>
                            {word.imageUrl && (
                              <img 
                                src={word.imageUrl} 
                                alt={word.word}
                                className="w-16 h-16 object-cover rounded"
                              />
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {word.exampleSentence && (
                            <div className="p-2 bg-blue-50 rounded text-sm italic">
                              "{word.exampleSentence}"
                            </div>
                          )}
                          {word.audioUrl && (
                            <audio src={word.audioUrl} controls className="w-full h-8" />
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-brand-gray text-center py-8">Vocabulary section not available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Video Section */}
          <TabsContent value="video">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-brand-blue" />
                  Video Lesson
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lesson.video ? (
                  <>
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <video 
                        src={lesson.video.videoUrl} 
                        controls 
                        className="w-full h-full"
                        poster={lesson.thumbnail}
                      >
                        {lesson.video.subtitlesUrl && (
                          <track 
                            kind="subtitles" 
                            src={lesson.video.subtitlesUrl} 
                            srcLang="en" 
                            label="English"
                          />
                        )}
                        Your browser does not support the video tag.
                      </video>
                    </div>
                    {lesson.video.estimatedMb && (
                      <p className="text-xs text-brand-gray mt-2 text-center">
                        Video size: ~{lesson.video.estimatedMb}MB
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-brand-gray text-center py-8">Video section not available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quizzes Section */}
          <TabsContent value="quizzes">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileQuestion className="h-5 w-5 text-brand-blue" />
                    Lesson Quizzes
                  </CardTitle>
                  {quizzes.length > 0 && user?.role === 'REFUGEE' && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-brand-gray">
                        {quizzes.filter(q => quizCompletionStatus[q._id]).length} / {quizzes.length} Completed
                      </span>
                      {areAllQuizzesCompleted() && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          ✓ All Complete
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {quizzes.length > 0 ? (
                  <>
                    {!areAllQuizzesCompleted() && user?.role === 'REFUGEE' && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <strong>Required:</strong> You must pass all quizzes to complete this lesson.
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {quizzes.map((quiz) => (
                        <div key={quiz._id} className="relative">
                          {quizCompletionStatus[quiz._id] && (
                            <div className="absolute -top-2 -right-2 z-10 bg-green-500 text-white rounded-full p-1">
                              <CheckCircle className="h-4 w-4" />
                            </div>
                          )}
                          <QuizCardWithProgress
                            quiz={quiz}
                            showHistory={true}
                            onTake={handleTakeQuiz}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-brand-gray text-center py-8">No quizzes available for this lesson</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button variant="outline" onClick={() => {
            const sections = ['reading', 'listening', 'vocabulary', 'video', 'quizzes']
            const currentIndex = sections.indexOf(activeSection)
            if (currentIndex > 0) {
              setActiveSection(sections[currentIndex - 1])
            }
          }} disabled={activeSection === 'reading'}>
            Previous Section
          </Button>
          
          <Button onClick={() => {
            const sections = ['reading', 'listening', 'vocabulary', 'video', 'quizzes']
            const currentIndex = sections.indexOf(activeSection)
            if (currentIndex < sections.length - 1) {
              setActiveSection(sections[currentIndex + 1])
            } else {
              handleComplete()
            }
          }}>
            {activeSection === 'quizzes' ? 'Complete Lesson' : 'Next Section'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default LessonPlayer
