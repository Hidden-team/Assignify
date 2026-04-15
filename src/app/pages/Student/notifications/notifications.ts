import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { collection, Firestore, getDocs, query, where } from '@angular/fire/firestore';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-notifications',
  standalone: false,
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class Notifications implements OnInit {

  private firestore   = inject(Firestore);
  private authService = inject(AuthService);
  private cdr         = inject(ChangeDetectorRef); 
  
  notifications: any[] = [];
  loading = true;
  uid     = '';

  async ngOnInit() {
    this.uid = this.authService.getUserProfile()?.uid ?? '';
    try {
      const snap = await getDocs(
        query(
          collection(this.firestore, 'notifications'),
          where('userId', '==', this.uid)
        )
      );

      this.notifications = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a: any, b: any) =>
          new Date(b.time).getTime() - new Date(a.time).getTime()
        );

    } catch (e) {
      console.error(e);
    } finally {
      this.loading = false;
      this.cdr.detectChanges(); 
    }
  }
}