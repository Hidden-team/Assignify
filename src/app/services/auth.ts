import { Injectable, NgZone, inject } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  getDoc,
  setDoc,
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

export type UserRole = 'student' | 'instructor' | 'admin';

export interface UserProfile {
  uid:       string;
  name:      string;
  email:     string;
  role:      UserRole;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  // ✅ Use inject() inside class body — works with both NgModule and standalone
  private fireAuth  = inject(Auth);
  private firestore = inject(Firestore);
  private router    = inject(Router);
  private ngZone    = inject(NgZone);

  // ── State ─────────────────────────────────────────────────────────────────
  private profileSubject = new BehaviorSubject<UserProfile | null>(null);
  userProfile$ = this.profileSubject.asObservable(); // ← public for layout

  private authReadySubject = new BehaviorSubject<boolean>(false);
  authReady$ = this.authReadySubject.asObservable(); // ← public for guard

  constructor() {
    // Restore session on every page load
    onAuthStateChanged(this.fireAuth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const snap = await getDoc(doc(this.firestore, 'users', firebaseUser.uid));
          if (snap.exists()) {
            const profile = { uid: firebaseUser.uid, ...snap.data() } as UserProfile;
            this.profileSubject.next(profile);

            // Redirect to dashboard if on public pages
            const url = this.router.url;
            if (url === '/login' || url === '/register' || url === '/') {
              this.ngZone.run(() => {
                this.router.navigate([`/${profile.role}/${profile.uid}/dashboard`]);
              });
            }
          }
        } catch (err) {
          console.error('Session restore error:', err);
          this.profileSubject.next(null);
        }
      } else {
        this.profileSubject.next(null);
      }
      this.authReadySubject.next(true);
    });
  }

  // ── REGISTER ──────────────────────────────────────────────────────────────
  async register(
    name:     string,
    email:    string,
    password: string,
    role:     UserRole,
  ): Promise<void> {
    const credential = await createUserWithEmailAndPassword(
      this.fireAuth, email, password
    );
    const uid = credential.user.uid;

    const profile: UserProfile = {
      uid, name, email, role,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(this.firestore, 'users', uid), profile);
    this.profileSubject.next(profile);
  }

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  async login(email: string, password: string, role: string): Promise<void> {
    const credential = await signInWithEmailAndPassword(
      this.fireAuth, email, password
    );
    const uid = credential.user.uid;

    const snap = await getDoc(doc(this.firestore, 'users', uid));
    if (!snap.exists()) {
      await signOut(this.fireAuth);
      throw { message: 'USER_NOT_FOUND' };
    }

    const profile = { uid, ...snap.data() } as UserProfile;

    if (profile.role !== role) {
      await signOut(this.fireAuth);
      throw { message: 'ROLE_MISMATCH' };
    }

    this.profileSubject.next(profile);
    this.ngZone.run(() => {
      this.router.navigate([`/${profile.role}/${uid}/dashboard`]);
    });
  }

  // ── LOGOUT ────────────────────────────────────────────────────────────────
  async logout(): Promise<void> {
    await signOut(this.fireAuth);
    this.profileSubject.next(null);
    this.ngZone.run(() => {
      this.router.navigate(['/login']);
    });
  }

  // ── GETTERS ───────────────────────────────────────────────────────────────
  getRole(): string | null             { return this.profileSubject.value?.role ?? null; }
  getUserProfile(): UserProfile | null { return this.profileSubject.value; }
  isLoggedIn(): boolean                { return !!this.profileSubject.value; }
}