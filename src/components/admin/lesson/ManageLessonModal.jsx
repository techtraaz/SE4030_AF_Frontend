import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, BookOpen, Headphones, BookMarked, Video } from 'lucide-react'
import { toastService } from '@/services/toastService'
import lessonService from '@/services/lesson/lessonService'
import readingService from '@/services/lesson/readingService'
import listeningService from '@/services/lesson/listeningService'
import vocabularyService from '@/services/lesson/vocabularyService'
import videoService from '@/services/lesson/videoService'
import courseService from '@/services/course/courseService'
import VocabularyWordsForm from './VocabularyWordsForm'
import HighlightWordsForm from './HighlightWordsForm'
import SearchableSelect from '@/components/shared/SearchableSelect'
import { lessonBasicInfoSchema } from '@/validations/lessonValidations'
import useAuth from '@/hooks/useAuth'

/**
 * ManageLessonModal - Comprehensive modal for creating/editing lessons
 * Features tab-based interface for all 4 sections
 */
const ManageLessonModal = ({ 
  isOpen, 
  onClose, 
  lesson = null, 
  courseId,
  categories = [],
  onSuccess = () => {} 
}) => {
  const { user } = useAuth()
  const isEditMode = !!lesson
  const [activeTab, setActiveTab] = useState('basic')
  const [loading, setLoading] = useState(false)
  const [currentLesson, setCurrentLesson] = useState(lesson)
  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState(courseId || lesson?.courseId || '')
  
  // Basic info form
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
    resolver: zodResolver(lessonBasicInfoSchema),
    defaultValues: {
      title: '',
      description: '',
      categoryId: '',
      difficulty: 'beginner',
      estimatedMinutes: 10,
      order: '',
      thumbnail: '',
    }
  })

  // Section states
  const [readingData, setReadingData] = useState({
    content: lesson?.reading?.content || '',
    highlightWords: lesson?.reading?.highlightWords || []
  })

  const [listeningData, setListeningData] = useState({
    audioUrl: lesson?.listening?.audioUrl || '',
    slowAudioUrl: lesson?.listening?.slowAudioUrl || '',
    transcript: lesson?.listening?.transcript || ''
  })

  const [vocabularyData, setVocabularyData] = useState({
    words: lesson?.vocabulary?.words || []
  })

  const [videoData, setVideoData] = useState({
    videoUrl: lesson?.video?.videoUrl || '',
    subtitlesUrl: lesson?.video?.subtitlesUrl || '',
    estimatedMb: lesson?.video?.estimatedMb || ''
  })

  // Load courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseService.getAllCourses({ createdById: user._id })
        setCourses(data)
      } catch (error) {
        toastService.error('Failed to load courses')
      }
    }
    if (user?._id) {
      fetchCourses()
    }
  }, [user])

  // Set form data when lesson changes or modal opens
  useEffect(() => {
    if (lesson) {
      setCurrentLesson(lesson)
      setSelectedCourseId(lesson.courseId || courseId)
      reset({
        title: lesson.title || '',
        description: lesson.description || '',
        categoryId: lesson.categoryId || '', // FIX: categoryId is already a string, not an object
        difficulty: lesson.difficulty || 'beginner',
        estimatedMinutes: lesson.estimatedMinutes || 10,
        order: lesson.order || '',
        thumbnail: lesson.thumbnail || '',
      })
      setReadingData({
        content: lesson.reading?.content || '',
        highlightWords: lesson.reading?.highlightWords || []
      })
      setListeningData({
        audioUrl: lesson.listening?.audioUrl || '',
        slowAudioUrl: lesson.listening?.slowAudioUrl || '',
        transcript: lesson.listening?.transcript || ''
      })
      setVocabularyData({
        words: lesson.vocabulary?.words || []
      })
      setVideoData({
        videoUrl: lesson.video?.videoUrl || '',
        subtitlesUrl: lesson.video?.subtitlesUrl || '',
        estimatedMb: lesson.video?.estimatedMb || ''
      })
    } else {
      // Reset everything for create mode
      setCurrentLesson(null)
      setSelectedCourseId(courseId || '')
      reset({
        title: '',
        description: '',
        categoryId: '',
        difficulty: 'beginner',
        estimatedMinutes: 10,
        order: '',
        thumbnail: '',
      })
      setReadingData({ content: '', highlightWords: [] })
      setListeningData({ audioUrl: '', slowAudioUrl: '', transcript: '' })
      setVocabularyData({ words: [] })
      setVideoData({ videoUrl: '', subtitlesUrl: '', estimatedMb: '' })
    }
  }, [lesson, courseId, reset])

  // Save basic info
  const onSubmitBasicInfo = async (data) => {
    if (!selectedCourseId) {
      toastService.error('Please select a course')
      return
    }

    try {
      setLoading(true)
      const payload = { ...data, courseId: selectedCourseId }
      
      let savedLesson
      if (isEditMode) {
        savedLesson = await lessonService.updateLesson(currentLesson._id, payload)
        toastService.success('Lesson updated successfully')
      } else {
        savedLesson = await lessonService.createLesson(payload)
        toastService.success('Lesson created successfully')
      }
      
      setCurrentLesson(savedLesson)
      setActiveTab('reading')
    } catch (error) {
      // Error handled by axios interceptor
    } finally {
      setLoading(false)
    }
  }

  // Save reading section
  const handleSaveReading = async () => {
    if (!currentLesson?._id) {
      toastService.error('Please save basic info first')
      return
    }

    try {
      setLoading(true)
      let savedReading
      
      if (currentLesson.reading) {
        savedReading = await readingService.updateReading(currentLesson._id, readingData)
      } else {
        savedReading = await readingService.createReading(currentLesson._id, readingData)
      }
      
      setCurrentLesson({ ...currentLesson, reading: savedReading })
      toastService.success('Reading section saved')
      setActiveTab('listening')
    } catch (error) {
      // Error handled by axios interceptor
    } finally {
      setLoading(false)
    }
  }

  // Save listening section
  const handleSaveListening = async () => {
    if (!currentLesson?._id) {
      toastService.error('Please save basic info first')
      return
    }

    try {
      setLoading(true)
      let savedListening
      
      if (currentLesson.listening) {
        savedListening = await listeningService.updateListening(currentLesson._id, listeningData)
      } else {
        savedListening = await listeningService.createListening(currentLesson._id, listeningData)
      }
      
      setCurrentLesson({ ...currentLesson, listening: savedListening })
      toastService.success('Listening section saved')
      setActiveTab('vocabulary')
    } catch (error) {
      // Error handled by axios interceptor
    } finally {
      setLoading(false)
    }
  }

  // Save vocabulary section
  const handleSaveVocabulary = async () => {
    if (!currentLesson?._id) {
      toastService.error('Please save basic info first')
      return
    }

    try {
      setLoading(true)
      let savedVocabulary
      
      if (currentLesson.vocabulary) {
        savedVocabulary = await vocabularyService.updateVocabulary(currentLesson._id, vocabularyData)
      } else {
        savedVocabulary = await vocabularyService.createVocabulary(currentLesson._id, vocabularyData)
      }
      
      setCurrentLesson({ ...currentLesson, vocabulary: savedVocabulary })
      toastService.success('Vocabulary section saved')
      setActiveTab('video')
    } catch (error) {
      // Error handled by axios interceptor
    } finally {
      setLoading(false)
    }
  }

  // Save video section
  const handleSaveVideo = async () => {
    if (!currentLesson?._id) {
      toastService.error('Please save basic info first')
      return
    }

    try {
      setLoading(true)
      let savedVideo
      
      if (currentLesson.video) {
        savedVideo = await videoService.updateVideo(currentLesson._id, videoData)
      } else {
        savedVideo = await videoService.createVideo(currentLesson._id, videoData)
      }
      
      setCurrentLesson({ ...currentLesson, video: savedVideo })
      toastService.success('Video section saved')
      onSuccess()
      handleClose()
    } catch (error) {
      // Error handled by axios interceptor
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    // Full reset of all states
    reset({
      title: '',
      description: '',
      categoryId: '',
      difficulty: 'beginner',
      estimatedMinutes: 10,
      order: '',
      thumbnail: '',
    })
    setActiveTab('basic')
    setCurrentLesson(null)
    setSelectedCourseId(courseId || '')
    setReadingData({ content: '', highlightWords: [] })
    setListeningData({ audioUrl: '', slowAudioUrl: '', transcript: '' })
    setVocabularyData({ words: [] })
    setVideoData({ videoUrl: '', subtitlesUrl: '', estimatedMb: '' })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Lesson' : 'Create New Lesson'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">
              <BookOpen className="h-4 w-4 mr-1" />
              Basic
            </TabsTrigger>
            <TabsTrigger value="reading" disabled={!currentLesson}>
              <BookOpen className="h-4 w-4 mr-1" />
              Reading
            </TabsTrigger>
            <TabsTrigger value="listening" disabled={!currentLesson}>
              <Headphones className="h-4 w-4 mr-1" />
              Listening
            </TabsTrigger>
            <TabsTrigger value="vocabulary" disabled={!currentLesson}>
              <BookMarked className="h-4 w-4 mr-1" />
              Vocabulary
            </TabsTrigger>
            <TabsTrigger value="video" disabled={!currentLesson}>
              <Video className="h-4 w-4 mr-1" />
              Video
            </TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-4 mt-4">
            <form onSubmit={handleSubmit(onSubmitBasicInfo)} className="space-y-4">
              <div>
                <SearchableSelect
                  label="Course"
                  placeholder="Select a course..."
                  value={selectedCourseId}
                  onChange={setSelectedCourseId}
                  options={courses.map(c => ({ value: c._id, label: c.title }))}
                  required
                  error={!selectedCourseId ? 'Course is required' : ''}
                  emptyMessage="No courses found. Please create a course first."
                />
              </div>

              <div>
                <Label htmlFor="title">Lesson Title *</Label>
                <Input id="title" {...register('title')} placeholder="Enter lesson title" />
                {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  {...register('description')}
                  placeholder="Brief description of the lesson"
                  className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="categoryId">Category *</Label>
                  <Select value={watch('categoryId')} onValueChange={(value) => setValue('categoryId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && <p className="text-sm text-red-500 mt-1">{errors.categoryId.message}</p>}
                </div>

                <div>
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select value={watch('difficulty')} onValueChange={(value) => setValue('difficulty', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estimatedMinutes">Duration (minutes)</Label>
                  <Input type="number" id="estimatedMinutes" {...register('estimatedMinutes')} />
                </div>

                <div>
                  <Label htmlFor="order">Order</Label>
                  <Input type="number" id="order" {...register('order')} placeholder="Optional" />
                </div>
              </div>

              <div>
                <Label htmlFor="thumbnail">Thumbnail URL</Label>
                <Input id="thumbnail" {...register('thumbnail')} placeholder="https://..." />
                {errors.thumbnail && <p className="text-sm text-red-500 mt-1">{errors.thumbnail.message}</p>}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {isEditMode ? 'Update & Continue' : 'Create & Continue'}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Reading Section Tab */}
          <TabsContent value="reading" className="space-y-4 mt-4">
            <div>
              <Label>Reading Content *</Label>
              <textarea
                value={readingData.content}
                onChange={(e) => setReadingData({ ...readingData, content: e.target.value })}
                placeholder="Enter the reading passage content..."
                className="w-full min-h-[200px] px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <Label>Highlight Words (Optional)</Label>
              <HighlightWordsForm
                words={readingData.highlightWords}
                onChange={(words) => setReadingData({ ...readingData, highlightWords: words })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setActiveTab('basic')}>
                Back
              </Button>
              <Button onClick={handleSaveReading} disabled={loading || !readingData.content}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save & Continue
              </Button>
            </div>
          </TabsContent>

          {/* Listening Section Tab */}
          <TabsContent value="listening" className="space-y-4 mt-4">
            <div>
              <Label>Audio URL *</Label>
              <Input
                value={listeningData.audioUrl}
                onChange={(e) => setListeningData({ ...listeningData, audioUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label>Slow Audio URL (Optional)</Label>
              <Input
                value={listeningData.slowAudioUrl}
                onChange={(e) => setListeningData({ ...listeningData, slowAudioUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label>Transcript *</Label>
              <textarea
                value={listeningData.transcript}
                onChange={(e) => setListeningData({ ...listeningData, transcript: e.target.value })}
                placeholder="Enter the audio transcript..."
                className="w-full min-h-[150px] px-3 py-2 border rounded-md"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setActiveTab('reading')}>
                Back
              </Button>
              <Button onClick={handleSaveListening} disabled={loading || !listeningData.audioUrl || !listeningData.transcript}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save & Continue
              </Button>
            </div>
          </TabsContent>

          {/* Vocabulary Section Tab */}
          <TabsContent value="vocabulary" className="space-y-4 mt-4">
            <div>
              <Label>Vocabulary Words *</Label>
              <VocabularyWordsForm
                words={vocabularyData.words}
                onChange={(words) => setVocabularyData({ words })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setActiveTab('listening')}>
                Back
              </Button>
              <Button onClick={handleSaveVocabulary} disabled={loading || !vocabularyData.words || vocabularyData.words.length === 0}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save & Continue
              </Button>
            </div>
          </TabsContent>

          {/* Video Section Tab */}
          <TabsContent value="video" className="space-y-4 mt-4">
            <div>
              <Label>Video URL *</Label>
              <Input
                value={videoData.videoUrl}
                onChange={(e) => setVideoData({ ...videoData, videoUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label>Subtitles URL (Optional)</Label>
              <Input
                value={videoData.subtitlesUrl}
                onChange={(e) => setVideoData({ ...videoData, subtitlesUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label>Estimated Size (MB - Optional)</Label>
              <Input
                type="number"
                value={videoData.estimatedMb}
                onChange={(e) => setVideoData({ ...videoData, estimatedMb: e.target.value })}
                placeholder="50"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setActiveTab('vocabulary')}>
                Back
              </Button>
              <Button onClick={handleSaveVideo} disabled={loading || !videoData.videoUrl}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save & Finish
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default ManageLessonModal
