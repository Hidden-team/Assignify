// Angular Modules
import { APP_INITIALIZER, NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTableModule }       from '@angular/material/table';  

// Main Components
import { App } from './app';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { AppRoutingModule } from './app-routing.module';

// Student Components
import { StudentDashboard } from './pages/Student/student-dashboard/student-dashboard';
import { Submit } from './pages/Student/submit/submit';
import { Assignments } from './pages/Student/assignments/assignments';
import { Layout } from './pages/Student/layout/layout';
import { Submission } from './pages/Student/submission/submission';

// Instructor Components
import { InstructorDashboard } from './pages/Instructor/instructor-dashboard/instructor-dashboard';
import { InstructorLayout } from './pages/Instructor/instructor-layout/instructor-layout';
import { InstructorUpload } from './pages/Instructor/instructor-upload/instructor-upload';
import { InstructorUploaded } from './pages/Instructor/instructor-uploaded/instructor-uploaded';
import { InstructorSubmission } from './pages/Instructor/instructor-submission/instructor-submission';
import { InstructorPending } from './pages/Instructor/instructor-pending/instructor-pending';

// Firebase require Modules
import { environment } from '../environments/environment';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth }               from '@angular/fire/auth';
import { provideFirestore, getFirestore }     from '@angular/fire/firestore';
import { Notifications } from './pages/Student/notifications/notifications';
import { Grades } from './pages/Student/grades/grades';
import { Profile } from './pages/Student/profile/profile';
import { AuthService } from './services/auth';



@NgModule({
  declarations: [
    App,
    Login,
    Register,
    StudentDashboard,
    InstructorDashboard,
    Layout,
    Submit,
    Submission,
    Assignments,
    Notifications,
    Grades,
    Profile,
    InstructorLayout,
    InstructorUpload,
    InstructorUploaded,
    InstructorSubmission,
    InstructorPending
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatListModule,
    MatTableModule,
  ],

 
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  
  ],
  bootstrap: [App]
})
export class AppModule { }

