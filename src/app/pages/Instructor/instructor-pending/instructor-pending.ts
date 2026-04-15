import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Firestore, collection, getDocs, query, where } from '@angular/fire/firestore';
import { AuthService } from '../../../services/auth';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-instructor-pending',
  standalone: false,
  templateUrl: './instructor-pending.html',
  styleUrl: './instructor-pending.css',
})
export class InstructorPending implements OnInit {

  private firestore   = inject(Firestore);
  private authService = inject(AuthService);
  private router      = inject(Router);
  private cdr         = inject(ChangeDetectorRef); 

  assignments:        any[] = [];
  selectedAssignment: any   = null;
  allStudents:        any[] = [];
  pendingStudents:    any[] = [];
  loading             = true;
  loadingStudents     = false;
  uid                 = '';

  async ngOnInit() {
    this.uid = this.authService.getUserProfile()?.uid ?? '';

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.loadAssignments());

    await this.loadAssignments();
  }

  async loadAssignments() {
    this.loading            = true;
    this.selectedAssignment = null;
    this.pendingStudents    = [];

    try {
      const snap = await getDocs(
        query(collection(this.firestore, 'assignments'),
          where('instructorId', '==', this.uid))
      );

      this.assignments = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

    } catch (err) {
      console.error(err);
    } finally {
      this.loading = false;
      this.cdr.detectChanges(); 
    }
  }

  async selectAssignment(a: any) {
    this.selectedAssignment = a;
    this.loadingStudents    = true;
    this.pendingStudents    = [];
    this.cdr.detectChanges(); 

    try {
      // Step 1: Get all students
      const studentSnap = await getDocs(
        query(collection(this.firestore, 'users'),
          where('role', '==', 'student'))
      );

      this.allStudents = studentSnap.docs.map(d => {
        const data = d.data() as any;
        return {
          uid:   data.uid,
          name:  data.name,
          email: data.email,
        };
      });

      // Step 2: Get submissions for this assignment
      const subSnap = await getDocs(
        query(collection(this.firestore, 'submissions'),
          where('assignmentId', '==', a.id))
      );

      // Step 3: Build set of submitted student UIDs
      const submittedSet = new Set<string>();
      subSnap.docs.forEach(d => {
        const studentId = (d.data() as any).studentId;
        submittedSet.add(studentId);
      });

      // Step 4: Filter pending students
      this.pendingStudents = this.allStudents.filter(s => !submittedSet.has(s.uid));

    } catch (err) {
      console.error(err);
    } finally {
      this.loadingStudents = false;
      this.cdr.detectChanges();
    }
  }
}