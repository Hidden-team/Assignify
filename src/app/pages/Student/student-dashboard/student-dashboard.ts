import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { collection, Firestore, getDocs, query, where } from '@angular/fire/firestore';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-student-dashboard',
  standalone: false,
  templateUrl: './student-dashboard.html',
  styleUrl: './student-dashboard.css',
})
export class StudentDashboard implements OnInit {

  private authService = inject(AuthService);
  private firestore   = inject(Firestore);
  private cdr         = inject(ChangeDetectorRef); // ✅ force change detection

  userName         = '';
  uid              = '';
  totalAssignments = 0;
  submitted        = 0;
  pending          = 0;
  graded           = 0;
  loading          = true;
  recentAssignments: any[] = [];

  async ngOnInit() {
    const profile = this.authService.getUserProfile();

    if (!profile) {
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.uid      = profile.uid;
    this.userName = profile.name;

    try {
      const assignSnap = await getDocs(collection(this.firestore, 'assignments'));
      this.totalAssignments  = assignSnap.size;
      this.recentAssignments = assignSnap.docs
        .slice(0, 5)
        .map(d => ({ id: d.id, ...d.data() }));

      const subSnap = await getDocs(
        query(
          collection(this.firestore, 'submissions'),
          where('studentId', '==', this.uid)
        )
      );

      this.submitted = subSnap.size;
      this.graded    = subSnap.docs.filter(d => d.data()['status'] === 'graded').length;
      this.pending   = Math.max(0, this.totalAssignments - this.submitted);

    } catch (err) {
      console.error('Firestore error:', err);
    } finally {
      this.loading = false;
      this.cdr.detectChanges(); // ✅ force Angular to update the view
    }
  }
}