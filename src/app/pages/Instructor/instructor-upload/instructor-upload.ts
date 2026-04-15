import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Firestore, collection, addDoc, updateDoc, doc } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-instructor-upload',
  standalone: false,
  templateUrl: './instructor-upload.html',
  styleUrl: './instructor-upload.css',
})
export class InstructorUpload {

  private fb          = inject(FormBuilder);
  private firestore   = inject(Firestore);
  private http        = inject(HttpClient);
  private authService = inject(AuthService);
  private router      = inject(Router);
  private cdr         = inject(ChangeDetectorRef);

  form: FormGroup = this.fb.group({
    title:      ['', [Validators.required, Validators.minLength(3)]],
    dueDate:    ['', Validators.required],
    totalMarks: [100, [Validators.required, Validators.min(1), Validators.max(1000)]],
  });

  loading        = false;
  success        = '';
  error          = '';
  selectedFile: File | null = null;
  fileError      = '';
  uploadProgress = 0;

  private CLOUDINARY_CLOUD_NAME    = environment.cloudinary.cloudName;
  private CLOUDINARY_UPLOAD_PRESET = environment.cloudinary.assignmentUploadPreset;

  // ─── File Handling ───────────────────────────────────────────

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
    // ✅ PDF only
    if (file.type !== 'application/pdf') {
      this.fileError = 'Only PDF files are allowed.';
      this.selectedFile = null;
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      this.fileError = 'File size exceeds 10MB limit.';
      this.selectedFile = null;
      return;
    }

    this.selectedFile = file;
    this.fileError    = '';
    this.uploadProgress = 0;
  }

  removeFile(event: MouseEvent): void {
    event.stopPropagation();
    this.selectedFile   = null;
    this.fileError      = '';
    this.uploadProgress = 0;
  }

  // ─── Upload to Cloudinary ─────────────────────────────────────
private uploadToCloudinary(
  file: File,
  assignmentId: string,
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', `assignments/${assignmentId}`);
    formData.append('tags', `assignment,${assignmentId}`);
    // ✅ Removed access_mode and type — they cause 400 with unsigned presets

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        this.uploadProgress = Math.round((event.loaded / event.total) * 100);
        this.cdr.detectChanges();
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const res = JSON.parse(xhr.responseText);
        resolve({ url: res.secure_url, publicId: res.public_id });
      } else {
        console.error('Cloudinary error response:', xhr.responseText); // 👈 check this
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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.selectedFile) {
      this.fileError = 'Please upload a PDF file.';
      return;
    }

    this.loading = true;
    this.error   = '';
    this.success = '';

    const profile = this.authService.getUserProfile();

    try {
      // Step 1: Create assignment doc to get ID
      const assignmentRef = await addDoc(collection(this.firestore, 'assignments'), {
        title:          this.form.value.title,
        dueDate:        this.form.value.dueDate,
        totalMarks:     Number(this.form.value.totalMarks),
        instructorId:   profile?.uid  ?? '',
        instructorName: profile?.name ?? '',
        createdAt:      new Date().toISOString(),
        fileName:       this.selectedFile.name,
        fileSize:       this.selectedFile.size,
      });

      // Step 2: Upload PDF to Cloudinary
      const { url: fileURL, publicId: filePublicId } = await this.uploadToCloudinary(
        this.selectedFile,
        assignmentRef.id,
      );

      // Step 3: Update assignment with file URL
      await updateDoc(doc(this.firestore, 'assignments', assignmentRef.id), {
        fileURL,
        filePublicId,
      });

      this.success       = 'Assignment created successfully!';
      this.selectedFile  = null;
      this.uploadProgress = 0;
      this.form.reset({ totalMarks: 100 });
      this.cdr.detectChanges(); // ✅

      setTimeout(() => this.router.navigate([`/instructor/${profile?.uid}/uploaded`]), 1500);

    } catch (err: any) {
      this.error = 'Failed to create assignment. Please try again.';
      console.error(err);
    } finally {
      this.loading = false;
      this.cdr.detectChanges(); // ✅
    }
  }
}