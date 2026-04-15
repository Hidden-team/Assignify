import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  form: FormGroup;
  error   = '';
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
  ) {
    this.form = this.fb.group({
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

    const { email, password, role } = this.form.value;

    try {
      await this.auth.login(email, password, role);
      // redirect is handled inside auth.service.login()
    } catch (err: any) {
      if      (err.message === 'ROLE_MISMATCH')              this.error = 'Role does not match your account.';
      else if (err.message === 'USER_NOT_FOUND')             this.error = 'No profile found. Please register.';
      else if (err.code    === 'auth/invalid-credential')    this.error = 'Invalid email or password.';
      else if (err.code    === 'auth/user-not-found')        this.error = 'No account with this email.';
      else if (err.code    === 'auth/wrong-password')        this.error = 'Incorrect password.';
      else if (err.code    === 'auth/too-many-requests')     this.error = 'Too many attempts. Try later.';
      else                                                   this.error = 'Login failed: ' + (err.message ?? err.code ?? 'Unknown error');
    } finally {
      this.loading = false;
    }
  }
}