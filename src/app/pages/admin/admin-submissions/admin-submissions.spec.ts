import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSubmissions } from './admin-submissions';

describe('AdminSubmissions', () => {
  let component: AdminSubmissions;
  let fixture: ComponentFixture<AdminSubmissions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminSubmissions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSubmissions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
