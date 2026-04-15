import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.html',
  styleUrl: './profile.css',
}) 
export class Profile implements OnInit {
  profile: any = null;
  constructor(private authService: AuthService) {}
  ngOnInit() { this.profile = this.authService.getUserProfile(); }
}
 