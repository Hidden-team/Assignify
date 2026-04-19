import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Firestore, collection, getDocs, deleteDoc, doc } from '@angular/fire/firestore';

@Component({
  selector: 'app-admin-assignments',
  standalone: false,
  templateUrl: './admin-assignments.html',
  styleUrl: './admin-assignments.css',
})
export class AdminAssignments implements OnInit {

  private firestore = inject(Firestore);
  private cdr       = inject(ChangeDetectorRef);

  assignments: any[] = [];
  loading      = true;
  search       = '';

  async ngOnInit() {
    try {
      const snap = await getDocs(collection(this.firestore, 'assignments'));
      this.assignments = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      console.error(err);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  get filtered() {
    return this.assignments.filter((a: any) =>
      a.title?.toLowerCase().includes(this.search.toLowerCase()) ||
      a.instructorName?.toLowerCase().includes(this.search.toLowerCase())
    );
  }

  async deleteAssignment(id: string) {
    if (!confirm('Delete this assignment?')) return;
    try {
      await deleteDoc(doc(this.firestore, 'assignments', id));
      this.assignments = this.assignments.filter((a: any) => a.id !== id);
      this.cdr.detectChanges();
    } catch (err) {
      console.error(err);
    }
  }

  isPastDue(dueDate: string): boolean {
    return new Date(dueDate) < new Date();
  }

  openFile(fileURL: string): void {
    window.open(fileURL, '_blank');
  }
}