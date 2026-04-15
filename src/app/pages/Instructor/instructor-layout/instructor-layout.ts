import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth';
 
@Component({
  selector: 'app-instructor-layout',
  standalone: false,
  templateUrl: './instructor-layout.html',
  styleUrl: './instructor-layout.css',
})
export class InstructorLayout implements OnInit {
 
  userName    = '';
  userEmail   = '';
  uid         = '';
  sidebarOpen = true;
  isMobile    = false;
 
  navItems = [
    { label: 'Dashboard',         icon: 'dashboard',     route: 'dashboard'   },
    { label: 'Upload Assignment',  icon: 'upload_file',   route: 'upload'      },
    { label: 'My Assignments',    icon: 'assignment',    route: 'uploaded'    },
    { label: 'Submissions',       icon: 'inbox',         route: 'submissions' },
    { label: 'Pending Students',  icon: 'pending',       route: 'pending'     },
  ];
 
  constructor(
    private authService: AuthService,
    private router:      Router,
  ) {}
 
  ngOnInit() {
    this.authService.userProfile$.subscribe(profile => {
      if (profile) {
        this.userName  = profile.name  ?? '';
        this.userEmail = profile.email ?? '';
        this.uid       = profile.uid   ?? '';
      }
    });
    this.isMobile    = window.innerWidth < 768;
    this.sidebarOpen = !this.isMobile;
  }
 
  getFullRoute(route: string): string {
    return `/instructor/${this.uid}/${route}`;
  }
 
  isActive(route: string): boolean {
    return this.router.url.includes(`/${route}`);
  }
 
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
 
  async logout() {
    await this.authService.logout();
  }
}