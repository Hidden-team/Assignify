import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Firestore, collection, getDocs, query, where } from '@angular/fire/firestore';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-instructor-dashboard',
  standalone: false,
  templateUrl: './instructor-dashboard.html',
  styleUrl: './instructor-dashboard.css',
})
export class InstructorDashboard implements OnInit {

  private authService = inject(AuthService);
  private firestore   = inject(Firestore);
  private cdr         = inject(ChangeDetectorRef); 

  userName         = '';
  uid              = '';
  totalAssignments = 0;
  totalSubmissions = 0;
  totalGraded      = 0;
  totalPending     = 0;
  loading          = true;
  recentSubmissions: any[] = [];

  async ngOnInit() {
    const profile  = this.authService.getUserProfile();
    this.userName  = profile?.name ?? '';
    this.uid       = profile?.uid  ?? '';

    try {
      const aSnap = await getDocs(
        query(collection(this.firestore, 'assignments'),
          where('instructorId', '==', this.uid))
      );
      this.totalAssignments = aSnap.size;
      const myAssignmentIds = aSnap.docs.map(d => d.id);

      if (myAssignmentIds.length > 0) {
        const sSnap = await getDocs(collection(this.firestore, 'submissions'));
        const allSubs = sSnap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter((s: any) => myAssignmentIds.includes(s.assignmentId));

        this.totalSubmissions = allSubs.length;
        this.totalGraded      = allSubs.filter((s: any) => s.status === 'graded').length;
        this.totalPending     = this.totalSubmissions - this.totalGraded;

        this.recentSubmissions = allSubs
          .sort((a: any, b: any) =>
            new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
          )
          .slice(0, 5)
          .map((s: any) => ({
            ...s,
            assignment: aSnap.docs.find(d => d.id === s.assignmentId)?.data()
          }));
      }

    } catch (err) {
      console.error(err);
    } finally {
      this.loading = false;
      this.cdr.detectChanges(); 
    }
  }
}