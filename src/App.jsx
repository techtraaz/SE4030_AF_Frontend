import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { restoreSession } from './features/auth/authSlice'
import UserLayout from './pages/user/layout/UserLayout.jsx'
import AdminLayout from './pages/admin/layout/AdminLayout.jsx'
import Home from './pages/user/Home.jsx'
import PublicCourses from './pages/user/BrowseCourses.jsx'
import Impact from './pages/user/Impact.jsx'
import Curriculum from './pages/user/Curriculum.jsx'
import GetInvolved from './pages/user/GetInvolved.jsx'
import Dashboard from './pages/user/Dashboard.jsx'
import RefugeeMyCourses from './pages/user/MyCourses.jsx'
import MyProgress from './pages/user/MyProgress.jsx'
import CourseDetail from './pages/user/CourseDetail.jsx'
import RefugeeProfile from '@/pages/user/RefugeeProfile.jsx'
import TranslatePage from '@/pages/user/TranslatePage.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import MyCourses from './pages/admin/MyCourses.jsx'
import MyLessons from './pages/admin/MyLessons.jsx'
import MyQuizzes from './pages/admin/MyQuizzes.jsx'
import ViewCourse from './pages/admin/ViewCourse.jsx'
import ViewLesson from './pages/admin/ViewLesson.jsx'
import ViewQuiz from './pages/admin/ViewQuiz.jsx'
import Categories from './pages/admin/Categories.jsx'
import Courses from './pages/admin/Courses.jsx'
import Users from './pages/admin/Users.jsx'
import DigitalLibraryHome from './pages/digitalLibrary/DigitalLibraryHome.jsx'
import DigitalLibraryDetail from './pages/digitalLibrary/DigitalLibraryDetail.jsx'
import ContributorDashboard from './pages/digitalLibrary/ContributorDashboard.jsx'
import ContentContributorProfile from '@/pages/admin/ContentProfile.jsx'
import Settings from './pages/admin/Settings.jsx'
import LessonPlayer from './pages/user/LessonPlayer.jsx'
import QuizPlayer from './pages/user/QuizPlayer.jsx'

// Forum Components
import ForumHub from './pages/forum/ForumHub.jsx'
import ForumPage from './pages/forum/ForumPage.jsx'
import PostThread from './pages/forum/PostThread.jsx'
import AdminForums from './pages/admin/AdminForums.jsx'
import CreateForumPage from './pages/admin/CreateForumPage.jsx'
import EditForumForm from './pages/admin/EditForumForm.jsx'
import ManageForumMembers from './pages/admin/ManageForumMembers.jsx'
import MyForums from './pages/user/MyForums.jsx'

export default function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(restoreSession())
  }, [dispatch])

  return (
    <>
      <Toaster
        position="bottom-right"
        richColors
        theme="light"
        visibleToasts={5}
      />
      <Routes>
        {/* =PUBLIC ROUTES - Marketing Site */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<PublicCourses />} />
          <Route path="/impact" element={<Impact />} />
          <Route path="/curriculum" element={<Curriculum />} />
          <Route path="/get-involved" element={<GetInvolved />} />
        </Route>

        {/* REFUGEE ROUTES - Dashboard */}
        <Route path="/dashboard" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="overview" element={<Dashboard />} />
          <Route path="my-courses" element={<RefugeeMyCourses />} />
          <Route path="my-forums" element={<MyForums />} />
          <Route path="forum" element={<ForumHub />} />
          <Route path="forum/:forumId" element={<ForumPage />} />
          <Route path="forum/:forumId/post/:postId" element={<PostThread />} />
          <Route path="progress" element={<MyProgress />} />
          <Route path="courses/:courseId" element={<CourseDetail />} />
          <Route path="lesson/:lessonId" element={<LessonPlayer />} />
          <Route path="quiz/:quizId" element={<QuizPlayer />} />
          <Route path="translate" element={<TranslatePage />} />
          <Route path="profile" element={<RefugeeProfile />} />
          <Route path="resources" element={<div className="p-6">Resources Page</div>} />
          <Route path="community" element={<div className="p-6">Community Page</div>} />
          <Route path="support" element={<div className="p-6">Support Page</div>} />
          <Route path="profile" element={<RefugeeProfile/>}/>
          <Route path="digital-library" element={<DigitalLibraryHome />} />
          <Route path="digital-library/:id" element={<DigitalLibraryDetail />} />     
          <Route path="settings" element={<div className="p-6">Settings Page</div>} />
        </Route>

        {/* CONTENT CONTRIBUTOR ROUTES - Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          
          {/* Content Management */}
          <Route path="my-courses" element={<MyCourses />} />
          <Route path="courses/:id" element={<ViewCourse />} />
          <Route path="my-lessons" element={<MyLessons />} />
          <Route path="lessons/:id" element={<ViewLesson />} />
          <Route path="my-quizzes" element={<MyQuizzes />} />
          <Route path="quizzes/:id" element={<ViewQuiz />} />
          
          {/* Admin Tools */}
          <Route path="categories" element={<Categories />} />
          <Route path="courses" element={<Courses />} />
          <Route path="users" element={<Users />} />
          <Route path="analytics" element={<div className="p-6">Analytics Page</div>} />
          <Route path="resources" element={<div className="p-6">Resources Page</div>} />
          <Route path="support" element={<div className="p-6">Support Page</div>} />
          <Route path="profile" element={<ContentContributorProfile/>} />          <Route path="digital-library" element={<ContributorDashboard />} />          <Route path="settings" element={<Settings />} />
          
          {/* Account Settings */}
          <Route path="profile" element={<ContentContributorProfile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="forums" element={<AdminForums />} />
          <Route path="forums/create" element={<CreateForumPage />} />
          <Route path="forums/:forumId/edit" element={<EditForumForm />} />
          <Route path="forums/:forumId/members" element={<ManageForumMembers />} />
        </Route>

        {/* REDIRECTS - Legacy & Cleanup */}
        {/* Redirect old auth routes to home (modal handles auth) */}
        <Route path="/auth/login" element={<Navigate to="/" replace />} />
        <Route path="/auth/register" element={<Navigate to="/" replace />} />
        
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}