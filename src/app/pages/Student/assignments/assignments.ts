import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { collection, Firestore, getDocs, query, where } from '@angular/fire/firestore';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-assignments',
  standalone: false,
  templateUrl: './assignments.html',
  styleUrl: './assignments.css',
})
export class Assignments implements OnInit {

  private firestore   = inject(Firestore);
  private authService = inject(AuthService);
  private router      = inject(Router);
  private cdr         = inject(ChangeDetectorRef); 

  assignments:  any[]       = [];
  submittedIds: Set<string> = new Set();
  loading = true;
  uid     = '';

  async ngOnInit() {
    const profile = this.authService.getUserProfile();
    this.uid      = profile?.uid ?? '';
    await this.load();
  }

  async load() {
    this.loading = true;
    try {
      const snap = await getDocs(collection(this.firestore, 'assignments'));
      this.assignments = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      const subSnap = await getDocs(
        query(collection(this.firestore, 'submissions'),
          where('studentId', '==', this.uid))
      );
      subSnap.docs.forEach(d => this.submittedIds.add(d.data()['assignmentId']));

    } catch (err) {
      console.error(err);
    } finally {
      this.loading = false;
      this.cdr.detectChanges(); 
    }
  }

  isSubmitted(id: string): boolean { return this.submittedIds.has(id); }
  isPastDue(dueDate: string): boolean { return new Date(dueDate) < new Date(); }

  goSubmit(assignmentId: string) {
    this.router.navigate([`/student/${this.uid}/submit`], {
      queryParams: { assignmentId }
    });
  }

  getPreviewUrl(fileURL: string): string {
    if (!fileURL) return '';
    if (fileURL.includes('/upload/')) {
      return fileURL.replace('/upload/', '/upload/fl_inline/');
    }
    return fileURL;
  }
}