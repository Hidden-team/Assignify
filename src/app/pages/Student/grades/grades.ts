import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { collection, doc, Firestore, getDoc, getDocs, query, where } from '@angular/fire/firestore';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-grades',
  standalone: false,
  templateUrl: './grades.html',
  styleUrl: './grades.css',
})
export class Grades implements OnInit {

  private firestore   = inject(Firestore);
  private authService = inject(AuthService);
  private cdr         = inject(ChangeDetectorRef); 

  grades:  any[] = [];
  loading = true;
  uid     = '';

  async ngOnInit() {
    this.uid = this.authService.getUserProfile()?.uid ?? '';
    try {
      const snap = await getDocs(
        query(
          collection(this.firestore, 'submissions'),
          where('studentId', '==', this.uid),
          where('status', '==', 'graded')
        )
      );

      this.grades = await Promise.all(snap.docs.map(async d => {
        const sub = { id: d.id, ...d.data() } as any;
        const aSnap = await getDoc(doc(this.firestore, 'assignments', sub.assignmentId));
        sub.assignment = aSnap.exists() ? aSnap.data() : null;
        return sub;
      }));

    } catch (e) {
      console.error(e);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
}