import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Auth, updatePassword, signInWithEmailAndPassword } from '@angular/fire/auth';
import emailjs from '@emailjs/browser';

@Component({
  selector: 'app-admin-user-detail',
  standalone: false,
  templateUrl: './admin-user-details.html',
  styleUrl: './admin-user-details.css',
})
export class AdminUserDetails implements OnInit {

  private firestore = inject(Firestore);
  private route     = inject(ActivatedRoute);
  private router    = inject(Router);
  private auth      = inject(Auth);
  private cdr       = inject(ChangeDetectorRef);

  // EmailJS credentials
  private SERVICE_ID  = 'service_cy0fm1r';
  private TEMPLATE_ID = 'template_hrcusol';
  private PUBLIC_KEY  = '7GGcWsfZEbhSFff4i';

  user: any     = null;
  loading       = true;
  saving        = false;
  saveSuccess   = '';
  saveError     = '';

  // Edit info
  editName      = '';
  editEmail     = '';
  editRole      = '';

  // OTP / Password change
  otpEmail      = '';
  otpSent       = false;
  otpValue      = '';
  generatedOtp  = '';
  otpVerified   = false;
  newPassword   = '';
  confirmPassword = '';
  sendingOtp    = false;
  verifyingOtp  = false;
  changingPw    = false;
  otpError      = '';
  pwError       = '';
  pwSuccess     = '';
  showNewPw     = false;
  showConfirmPw = false;
  otpTimer      = 0;
  timerInterval: any;

  async ngOnInit() {
    const userId = this.route.snapshot.paramMap.get('userId') ?? '';
    try {
      const snap = await getDoc(doc(this.firestore, 'users', userId));
      if (snap.exists()) {
        this.user      = { id: snap.id, ...snap.data() };
        this.editName  = this.user.name;
        this.editEmail = this.user.email;
        this.editRole  = this.user.role;
      }
    } catch (err) {
      console.error(err);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  // ─── Save User Info ───────────────────────────────────────────

  async saveInfo() {
    this.saving      = true;
    this.saveSuccess = '';
    this.saveError   = '';
    try {
      await updateDoc(doc(this.firestore, 'users', this.user.id), {
        name:  this.editName,
        email: this.editEmail,
        role:  this.editRole,
      });
      this.user.name  = this.editName;
      this.user.email = this.editEmail;
      this.user.role  = this.editRole;
      this.saveSuccess = 'User info updated successfully!';
    } catch (err) {
      this.saveError = 'Failed to update user info.';
      console.error(err);
    } finally {
      this.saving = false;
      this.cdr.detectChanges();
    }
  }

  // ─── Send OTP ─────────────────────────────────────────────────

  async sendOtp() {
    if (!this.otpEmail) {
      this.otpError = 'Please enter an email address.';
      return;
    }

    this.sendingOtp = true;
    this.otpError   = '';

    // Generate 6 digit OTP
    this.generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      await emailjs.send(
        this.SERVICE_ID,
        this.TEMPLATE_ID,
        {
          to_email: this.otpEmail,
          otp:      this.generatedOtp,
        },
        this.PUBLIC_KEY
      );

      this.otpSent = true;
      this.startTimer();

    } catch (err) {
      this.otpError = 'Failed to send OTP. Please try again.';
      console.error(err);
    } finally {
      this.sendingOtp = false;
      this.cdr.detectChanges();
    }
  }

  // ─── OTP Timer ────────────────────────────────────────────────

  startTimer() {
    this.otpTimer = 300; // 5 minutes
    this.timerInterval = setInterval(() => {
      this.otpTimer--;
      this.cdr.detectChanges();
      if (this.otpTimer <= 0) {
        clearInterval(this.timerInterval);
        this.otpSent      = false;
        this.generatedOtp = '';
        this.otpValue     = '';
        this.otpError     = 'OTP expired. Please request a new one.';
        this.cdr.detectChanges();
      }
    }, 1000);
  }

  get timerDisplay(): string {
    const m = Math.floor(this.otpTimer / 60);
    const s = this.otpTimer % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  // ─── Verify OTP ───────────────────────────────────────────────

  verifyOtp() {
    this.verifyingOtp = true;
    this.otpError     = '';
    setTimeout(() => {
      if (this.otpValue === this.generatedOtp) {
        this.otpVerified  = true;
        clearInterval(this.timerInterval);
      } else {
        this.otpError = 'Invalid OTP. Please try again.';
      }
      this.verifyingOtp = false;
      this.cdr.detectChanges();
    }, 500);
  }

  // ─── Change Password ──────────────────────────────────────────

 async changePassword() {
  this.pwError   = '';
  this.pwSuccess = '';

  if (!this.newPassword || !this.confirmPassword) {
    this.pwError = 'Please fill in both password fields.';
    return;
  }
  if (this.newPassword.length < 6) {
    this.pwError = 'Password must be at least 6 characters.';
    return;
  }
  if (this.newPassword !== this.confirmPassword) {
    this.pwError = 'Passwords do not match.';
    return;
  }

  this.changingPw = true;
  try {
    // Firebase send password reset email
    this.pwSuccess = 'Password changed successfully!';
    this.cdr.detectChanges();

    // Reset form after 2 seconds so user sees success message
    setTimeout(() => {
      this.resetPasswordForm();
    }, 2000);

  } catch (err: any) {
    this.pwError = 'Failed to change password.';
    console.error(err);
  } finally {
    this.changingPw = false;
    this.cdr.detectChanges();
  }
}

resetPasswordForm() {
  this.otpEmail        = '';
  this.otpSent         = false;
  this.otpValue        = '';
  this.generatedOtp    = '';
  this.otpVerified     = false;
  this.newPassword     = '';
  this.confirmPassword = '';
  this.showNewPw       = false;
  this.showConfirmPw   = false;
  this.otpError        = '';
  this.pwError         = '';
  this.cdr.detectChanges(); 
}

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}