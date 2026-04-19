import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Firestore, collection, getDocs, deleteDoc, doc } from '@angular/fire/firestore';

@Component({
  selector: 'app-admin-users',
  standalone: false,
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css',
})
export class AdminUsers implements OnInit {

  private firestore = inject(Firestore);
  private cdr       = inject(ChangeDetectorRef);

  users:   any[] = [];
  loading  = true;
  filter: 'all' | 'student' | 'instructor' = 'all';
  search   = '';

  async ngOnInit() {
    try {
      const snap = await getDocs(collection(this.firestore, 'users'));
      this.users = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      console.error(err);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  get filtered() {
    return this.users.filter((u: any) => {
      const matchRole   = this.filter === 'all' || u.role === this.filter;
      const matchSearch = u.name?.toLowerCase().includes(this.search.toLowerCase()) ||
                         u.email?.toLowerCase().includes(this.search.toLowerCase());
      return matchRole && matchSearch;
    });
  }

  async deleteUser(id: string) {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(this.firestore, 'users', id));
      this.users = this.users.filter((u: any) => u.id !== id);
      this.cdr.detectChanges();
    } catch (err) {
      console.error(err);
    }
  }

  setFilter(f: 'all' | 'student' | 'instructor') {
    this.filter = f;
  }
}