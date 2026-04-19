import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { authGuard } from './guards/auth-guard';
import { StudentDashboard } from './pages/Student/student-dashboard/student-dashboard';
import { InstructorDashboard } from './pages/Instructor/instructor-dashboard/instructor-dashboard';
import { Layout } from './pages/Student/layout/layout';
import { Assignments } from './pages/Student/assignments/assignments';
import { Submit } from './pages/Student/submit/submit';
import { Submission } from './pages/Student/submission/submission';
import { Notifications } from './pages/Student/notifications/notifications';
import { Profile } from './pages/Student/profile/profile';
import { Grades } from './pages/Student/grades/grades';
import { InstructorLayout } from './pages/Instructor/instructor-layout/instructor-layout';
import { InstructorSubmission } from './pages/Instructor/instructor-submission/instructor-submission';
import { InstructorUploaded } from './pages/Instructor/instructor-uploaded/instructor-uploaded';
import { InstructorUpload } from './pages/Instructor/instructor-upload/instructor-upload';
import { InstructorPending } from './pages/Instructor/instructor-pending/instructor-pending';
import { AdminDashboard } from './pages/admin/admin-dashboard/admin-dashboard';
import { AdminAssignments } from './pages/admin/admin-assignments/admin-assignments';
import { AdminLayout } from './pages/admin/admin-layout/admin-layout';
import { AdminSubmissions } from './pages/admin/admin-submissions/admin-submissions';
import { AdminUsers } from './pages/admin/admin-users/admin-users';
import { AdminUserDetails } from './pages/admin/admin-user-details/admin-user-details';

const routes: Routes = [
  //  Public
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },

  //  Student routes (:id = Firebase UID)
  {
    path: 'student/:id',
    component: Layout,
    canActivate: [authGuard('student')],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: StudentDashboard },
      { path: 'assignments', component: Assignments },
      { path: 'submit', component: Submit },
      { path: 'submissions', component: Submission },
      { path: 'notifications', component: Notifications },
      { path: 'profile', component: Profile },
      { path: 'grades', component: Grades },
    ],
  },

  //  Instructor routes (:id = Firebase UID)
  {
    path: 'instructor/:id',
    component: InstructorLayout,
    canActivate: [authGuard('instructor')],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: InstructorDashboard },
      { path: 'upload', component: InstructorUpload },
      { path: 'uploaded', component: InstructorUploaded },
      { path: 'submissions', component: InstructorSubmission },
      { path: 'pending', component: InstructorPending },
    ],
  },

    //  Admin routes (:id = Firebase UID)
  {
    path: 'admin/:id',
    component: AdminLayout,
    canActivate: [authGuard('admin')],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboard },
      { path: 'users', component: AdminUsers },
      { path: 'assignments', component: AdminAssignments },
      { path: 'submissions', component: AdminSubmissions },
      { path: 'users/:userId', component: AdminUserDetails },
    ],
  },

  //  Fallback
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
