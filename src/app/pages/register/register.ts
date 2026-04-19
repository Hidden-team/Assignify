import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, UserRole } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  form: FormGroup;
  error   = '';
  success = '';
  loading = false;
  showPw  = false;

  roles = [
    { value: 'student',    label: 'Student',    icon: 'school'  },
    { value: 'instructor', label: 'Instructor', icon: 'person'  },
    { value: 'admin',      label: 'Admin',      icon: 'shield'  },
  ];

  constructor(
    private fb:   FormBuilder,
    private auth: AuthService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      name:     ['', [Validators.required, Validators.minLength(3)]],
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role:     ['', Validators.required],
    });
  }

  pickRole(role: string) {
    this.form.patchValue({ role });
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error   = '';
    this.success = '';

    const { name, email, password, role } = this.form.value;

    try {
      await this.auth.register(name, email, password, role as UserRole);
      this.success = 'Account created! Redirecting to login...';
      setTimeout(() => this.router.navigate(['/login']), 2000);
    } catch (err: any) {
      if      (err.code === 'auth/email-already-in-use') this.error = 'Email already registered.';
      else if (err.code === 'auth/invalid-email')        this.error = 'Invalid email address.';
      else if (err.code === 'auth/weak-password')        this.error = 'Password too weak (min 6 chars).';
      else                                               this.error = 'Registration failed: ' + (err.message ?? err.code ?? 'Unknown error');
    } finally {
      this.loading = false;
    }
  }
}