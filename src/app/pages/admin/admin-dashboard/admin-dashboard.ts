import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {

  private firestore   = inject(Firestore);
  private authService = inject(AuthService);
  private cdr         = inject(ChangeDetectorRef);

  userName         = '';
  totalStudents    = 0;
  totalInstructors = 0;
  totalAssignments = 0;
  totalSubmissions = 0;
  totalGraded      = 0;
  totalPending     = 0;
  loading          = true;
  recentUsers: any[]        = [];
  recentSubmissions: any[]  = [];

  async ngOnInit() {
    const profile  = this.authService.getUserProfile();
    this.userName  = profile?.name ?? '';

    try {
      // Get all users
      const usersSnap = await getDocs(collection(this.firestore, 'users'));
      const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      this.totalStudents    = users.filter((u: any) => u.role === 'student').length;
      this.totalInstructors = users.filter((u: any) => u.role === 'instructor').length;
      this.recentUsers      = users.slice(0, 5);

      // Get all assignments
      const assignSnap = await getDocs(collection(this.firestore, 'assignments'));
      this.totalAssignments = assignSnap.size;

      // Get all submissions
      const subSnap = await getDocs(collection(this.firestore, 'submissions'));
      const subs = subSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      this.totalSubmissions = subs.length;
      this.totalGraded      = subs.filter((s: any) => s.status === 'graded').length;
      this.totalPending     = subs.filter((s: any) => s.status === 'submitted').length;
      this.recentSubmissions = subs
        .sort((a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
        .slice(0, 5);

    } catch (err) {
      console.error(err);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
}