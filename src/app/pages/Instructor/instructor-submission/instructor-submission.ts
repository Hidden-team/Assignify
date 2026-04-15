import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Firestore, collection, getDocs, query, where, doc, updateDoc } from '@angular/fire/firestore';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-instructor-submission',
  standalone: false,
  templateUrl: './instructor-submission.html',
  styleUrl: './instructor-submission.css',
})
export class InstructorSubmission implements OnInit {

  private firestore   = inject(Firestore);
  private authService = inject(AuthService);
  private cdr         = inject(ChangeDetectorRef);

  submissions:  any[] = [];
  loading       = true;
  uid           = '';
  filter: 'all' | 'submitted' | 'graded' = 'all';

  gradingId     = '';
  gradeValue    = 0;
  feedbackValue = '';
  grading       = false;
  showModal     = false;
  selectedSub: any = null;

  async ngOnInit() {
    this.uid = this.authService.getUserProfile()?.uid ?? '';
    await this.load();
  }

  async load() {
    this.loading = true;
    try {
      const aSnap = await getDocs(
        query(collection(this.firestore, 'assignments'),
          where('instructorId', '==', this.uid))
      );
      const myAssignmentIds = aSnap.docs.map(d => d.id);
      const assignmentMap: Record<string, any> = {};
      aSnap.docs.forEach(d => assignmentMap[d.id] = d.data());

      if (myAssignmentIds.length === 0) {
        this.submissions = [];
        return;
      }

      const sSnap = await getDocs(collection(this.firestore, 'submissions'));
      this.submissions = sSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter((s: any) => myAssignmentIds.includes(s.assignmentId))
        .map((s: any) => ({ ...s, assignment: assignmentMap[s.assignmentId] }))
        .sort((a: any, b: any) =>
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

  openGrade(sub: any) {
    this.selectedSub   = sub;
    this.gradingId     = sub.id;
    this.gradeValue    = sub.grade ?? 0;
    this.feedbackValue = sub.feedback ?? '';
    this.showModal     = true;
    this.cdr.detectChanges();
  }

  closeModal() {
    this.showModal   = false;
    this.selectedSub = null;
    this.cdr.detectChanges();
  }

  async saveGrade() {
    if (!this.gradingId) return;
    this.grading = true;
    try {
      await updateDoc(doc(this.firestore, 'submissions', this.gradingId), {
        grade:    this.gradeValue,
        feedback: this.feedbackValue,
        status:   'graded',
      });

      const sub = this.submissions.find((s: any) => s.id === this.gradingId);
      if (sub) {
        sub.grade    = this.gradeValue;
        sub.feedback = this.feedbackValue;
        sub.status   = 'graded';
      }
      this.closeModal();
    } catch (err) {
      console.error(err);
    } finally {
      this.grading = false;
      this.cdr.detectChanges();
    }
  }
}