import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-admin-layout',
  standalone: false,
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout implements OnInit {

  private authService = inject(AuthService);
  private router      = inject(Router);
  private cdr         = inject(ChangeDetectorRef);

  userName     = '';
  userEmail    = '';
  uid          = '';
  sidebarOpen  = true;
  isMobile     = false;
  authReady    = false;

  navItems = [
    { label: 'Dashboard',    icon: 'dashboard',       route: 'dashboard'    },
    { label: 'Users',        icon: 'people',          route: 'users'        },
    { label: 'Assignments',  icon: 'assignment',      route: 'assignments'  },
    { label: 'Submissions',  icon: 'task',            route: 'submissions'  },
  ];

  ngOnInit() {
    this.authService.userProfile$.subscribe(profile => {
      if (profile) {
        this.userName  = profile.name;
        this.userEmail = profile.email;
        this.uid       = profile.uid;
        this.authReady = true;
        this.cdr.detectChanges();
      }
    });
    this.isMobile    = window.innerWidth < 768;
    this.sidebarOpen = !this.isMobile;
  }

  getFullRoute(route: string): string {
    return `/admin/${this.uid}/${route}`;
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