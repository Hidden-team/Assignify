import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout implements OnInit {
 
  userName = '';
  userEmail = '';
  uid = '';
  sidebarOpen = true;
  isMobile = false;
 
  navItems = [
    { label: 'Dashboard',         icon: 'dashboard',        route: 'dashboard'    },
    { label: 'Assignments',       icon: 'assignment',       route: 'assignments'  },
    { label: 'Submit',            icon: 'upload_file',      route: 'submit'       },
    { label: 'My Submissions',    icon: 'task',             route: 'submissions'  },
    { label: 'Grades',            icon: 'grade',            route: 'grades'       },
    { label: 'Notifications',     icon: 'notifications',    route: 'notifications'},
    { label: 'Profile',           icon: 'account_circle',   route: 'profile'      },
  ];
 
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}
 
  ngOnInit() {
    const profile  = this.authService.getUserProfile();
    this.userName  = profile?.name  ?? '';
    this.userEmail = profile?.email ?? '';
    this.uid       = profile?.uid   ?? '';
    this.isMobile  = window.innerWidth < 768;
    this.sidebarOpen = !this.isMobile;
  }
 
  getFullRoute(route: string): string {
    return `/student/${this.uid}/${route}`;
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