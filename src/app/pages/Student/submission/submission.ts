import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { doc, collection, Firestore, getDoc, getDocs, query, where } from '@angular/fire/firestore';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-submission',
  standalone: false,
  templateUrl: './submission.html',
  styleUrl: './submission.css',
})
export class Submission implements OnInit {

  private firestore   = inject(Firestore);
  private authService = inject(AuthService);
  private cdr         = inject(ChangeDetectorRef); 

  submissions: any[] = [];
  loading = true;
  uid     = '';
  filter: 'all' | 'submitted' | 'graded' | 'pending' = 'all';

  async ngOnInit() {
    this.uid = this.authService.getUserProfile()?.uid ?? '';
    await this.load();
  }

  async load() {
    this.loading = true;
    try {
      const snap = await getDocs(
        query(collection(this.firestore, 'submissions'),
          where('studentId', '==', this.uid))
      );

      const subs = await Promise.all(snap.docs.map(async d => {
        const sub = { id: d.id, ...d.data() };
        try {
          const aSnap = await getDoc(doc(this.firestore, 'assignments', (sub as any).assignmentId));
          (sub as any).assignment = aSnap.exists() ? aSnap.data() : null;
        } catch { (sub as any).assignment = null; }
        return sub;
      }));

      this.submissions = subs.sort((a: any, b: any) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );

    } catch (err) {
      console.error(err);
    } finally {
      this.loading = false;
      this.cdr.detectChanges(); 
    }
  }

  get filtered() {
    if (this.filter === 'all') return this.submissions;
    return this.submissions.filter((s: any) => s.status === this.filter);
  }

  setFilter(f: 'all' | 'submitted' | 'graded' | 'pending') {
    this.filter = f;
  }
}