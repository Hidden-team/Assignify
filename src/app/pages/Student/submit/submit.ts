import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { addDoc, collection, doc, Firestore, getDoc, getDocs, query, where } from '@angular/fire/firestore';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-submit',
  standalone: false,
  templateUrl: './submit.html',
  styleUrl: './submit.css',
})
export class Submit implements OnInit {

  private fb          = inject(FormBuilder);
  private firestore   = inject(Firestore);
  private authService = inject(AuthService);
  private route       = inject(ActivatedRoute);
  private router      = inject(Router);
  private sanitizer   = inject(DomSanitizer);
  private cdr         = inject(ChangeDetectorRef); // ✅

  form: FormGroup = this.fb.group({ notes: [''] });

  assignment: any = null;
  loading          = true;
  submitting       = false;
  success          = '';
  error            = '';
  uid              = '';
  userName         = '';
  assignmentId     = '';
  alreadySubmitted = false;

  selectedFile:   File | null = null;
  fileError       = '';
  uploadProgress  = 0;

  private CLOUDINARY_CLOUD_NAME    = environment.cloudinary.cloudName;
  private CLOUDINARY_UPLOAD_PRESET = environment.cloudinary.submissionUploadPreset;

  async ngOnInit() {
    const profile     = this.authService.getUserProfile();
    this.uid          = profile?.uid  ?? '';
    this.userName     = profile?.name ?? '';
    this.assignmentId = this.route.snapshot.queryParams['assignmentId'] ?? '';

    if (!this.assignmentId) {
      this.router.navigate([`/student/${this.uid}/assignments`]);
      return;
    }

    try {
      const snap = await getDoc(doc(this.firestore, 'assignments', this.assignmentId));
      if (snap.exists()) {
        this.assignment = { id: snap.id, ...snap.data() };
      }

      const subSnap = await getDocs(
        query(collection(this.firestore, 'submissions'),
          where('studentId',    '==', this.uid),
          where('assignmentId', '==', this.assignmentId))
      );
      this.alreadySubmitted = !subSnap.empty;

    } catch (err) {
      console.error(err);
    } finally {
      this.loading = false;
      this.cdr.detectChanges(); // ✅ force view update
    }
  }

  // ─── File Handling ────────────────────────────────────────────

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.validateAndSetFile(input.files[0]);
    }
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) this.validateAndSetFile(file);
  }

  validateAndSetFile(file: File): void {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip',
      'text/plain',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];
    const maxSize = 10 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      this.fileError = 'Invalid file type. Allowed: PDF, DOC, DOCX, ZIP, TXT, PPT, PPTX.';
      this.selectedFile = null;
      return;
    }
    if (file.size > maxSize) {
      this.fileError = 'File exceeds 10MB limit.';
      this.selectedFile = null;
      return;
    }

    this.selectedFile = file;
    this.fileError = '';
    this.uploadProgress = 0;
  }

  removeFile(event: MouseEvent): void {
    event.stopPropagation();
    this.selectedFile = null;
    this.fileError = '';
    this.uploadProgress = 0;
  }

  // ─── Upload to Cloudinary ─────────────────────────────────────

  private uploadToCloudinary(file: File): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', `submissions/${this.assignmentId}/${this.uid}`);
      formData.append('tags', `submission,assignment_${this.assignmentId},student_${this.uid}`);
      formData.append('context',
        `assignment_id=${this.assignmentId}|student_id=${this.uid}|student_name=${this.userName}`
      );

      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          this.uploadProgress = Math.round((event.loaded / event.total) * 100);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const res = JSON.parse(xhr.responseText);
          resolve({ url: res.secure_url, publicId: res.public_id });
        } else {
          reject(new Error('Cloudinary upload failed'));
        }
      };

      xhr.onerror = () => reject(new Error('Network error'));

      xhr.open('POST',
        `https://api.cloudinary.com/v1_1/${this.CLOUDINARY_CLOUD_NAME}/auto/upload`
      );
      xhr.send(formData);
    });
  }

  // ─── Submit ───────────────────────────────────────────────────

  async submit() {
    if (!this.selectedFile) {
      this.fileError = 'Please upload your assignment file.';
      return;
    }

    this.submitting = true;
    this.error      = '';
    this.success    = '';

    try {
      const { url: fileURL, publicId: filePublicId } = await this.uploadToCloudinary(this.selectedFile);

      await addDoc(collection(this.firestore, 'submissions'), {
        assignmentId:  this.assignmentId,
        studentId:     this.uid,
        studentName:   this.userName,
        submittedAt:   new Date().toISOString(),
        fileURL,
        filePublicId,
        fileName:      this.selectedFile.name,
        fileSize:      this.selectedFile.size,
        status:        'submitted',
        grade:         null,
        feedback:      '',
      });

      this.success      = 'Assignment submitted successfully!';
      this.selectedFile = null;
      this.uploadProgress = 0;
      this.cdr.detectChanges(); // ✅

      setTimeout(() => this.router.navigate([`/student/${this.uid}/submissions`]), 2000);

    } catch (err: any) {
      this.error = 'Submission failed. Please try again.';
      console.error(err);
    } finally {
      this.submitting = false;
      this.cdr.detectChanges(); // ✅
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────

  isPDF(url: string): boolean {
    return url?.toLowerCase().includes('.pdf') ||
           url?.toLowerCase().includes('/raw/upload/') === false &&
           url?.toLowerCase().includes('f_auto') === false &&
           url?.split('?')[0].endsWith('.pdf');
  }

  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  goBack() {
    this.router.navigate([`/student/${this.uid}/assignments`]);
  }

  onFileChange(event: any) {}
}