import { Component, signal } from '@angular/core';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App {
constructor(private firestore: Firestore) {}

  async ngOnInit() {
    try {
      await setDoc(doc(this.firestore, 'test', 'connection'), {
        message: 'Firebase connected!',
        time: new Date().toISOString()
      });
      console.log('✅ Firestore connected and working!');
    } catch (err) {
      console.error('❌ Firestore connection failed:', err);
    }
  }
}
