import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Firestore, collection, getDocs, doc, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-admin-submissions',
  standalone: false,
  templateUrl: './admin-submissions.html',
  styleUrl: './admin-submissions.css',
})
export class AdminSubmissions implements OnInit {

  private firestore = inject(Firestore);
  private cdr       = inject(ChangeDetectorRef);

  submissions: any[] = [];
  loading      = true;
  search       = '';
  filter: 'all' | 'submitted' | 'graded' = 'all';

  async ngOnInit() {
    try {
      const snap = await getDocs(collection(this.firestore, 'submissions'));
      this.submissions = await Promise.all(snap.docs.map(async d => {
        const sub = { id: d.id, ...d.data() } as any;
        try {
          const aSnap = await getDoc(doc(this.firestore, 'assignments', sub.assignmentId));
          sub.assignment = aSnap.exists() ? aSnap.data() : null;
        } catch { sub.assignment = null; }
        return sub;
      }));
      this.submissions.sort((a: any, b: any) =>
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
    return this.submissions.filter((s: any) => {
      const matchFilter = this.filter === 'all' || s.status === this.filter;
      const matchSearch = s.studentName?.toLowerCase().includes(this.search.toLowerCase()) ||
                         s.assignment?.title?.toLowerCase().includes(this.search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }

  setFilter(f: 'all' | 'submitted' | 'graded') {
    this.filter = f;
  }

  openFile(fileURL: string): void {
    window.open(fileURL, '_blank');
  }
}