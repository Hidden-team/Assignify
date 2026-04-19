import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAssignments } from './admin-assignments';

describe('AdminAssignments', () => {
  let component: AdminAssignments;
  let fixture: ComponentFixture<AdminAssignments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminAssignments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAssignments);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
