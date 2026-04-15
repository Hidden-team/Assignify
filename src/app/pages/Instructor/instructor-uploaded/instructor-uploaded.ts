import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Firestore, collection, query, where, getDocs, deleteDoc, doc } from '@angular/fire/firestore';
import { AuthService } from '../../../services/auth';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-instructor-uploaded',
  standalone: false,
  templateUrl: './instructor-uploaded.html',
  styleUrl: './instructor-uploaded.css',
})
export class InstructorUploaded implements OnInit {

  private firestore   = inject(Firestore);
  private authService = inject(AuthService);
  private router      = inject(Router);
  private cdr         = inject(ChangeDetectorRef);
  private http        = inject(HttpClient);

  assignments: any[] = [];
  loading = true;
  uid     = '';

  async ngOnInit() {
    this.uid = this.authService.getUserProfile()?.uid ?? '';
    await this.load();
  }

  async load() {
    this.loading = true;
    try {
      const snap = await getDocs(
        query(collection(this.firestore, 'assignments'),
          where('instructorId', '==', this.uid))
      );
      this.assignments = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    } catch (err) {
      console.error(err);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async delete(id: string) {
    if (!confirm('Delete this assignment? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(this.firestore, 'assignments', id));
      this.assignments = this.assignments.filter((a: any) => a.id !== id);
      this.cdr.detectChanges();
    } catch (err) {
      console.error(err);
    }
  }

  // ✅ Fetch PDF as blob and open in new tab — bypasses 401 completely
  async openFile(fileURL: string): Promise<void> {
    try {
      const blob = await this.http.get(fileURL, { responseType: 'blob' }).toPromise();
      if (!blob) return;
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      // Clean up blob URL after 60 seconds
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (err) {
      console.error('Failed to open file:', err);
      // Fallback: open directly
      window.open(fileURL, '_blank');
    }
  }

  isPastDue(dueDate: string): boolean {
    return new Date(dueDate) < new Date();
  }

  goUpload() {
    this.router.navigate([`/instructor/${this.uid}/upload`]);
  }
}