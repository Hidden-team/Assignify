import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructorPending } from './instructor-pending';

describe('InstructorPending', () => {
  let component: InstructorPending;
  let fixture: ComponentFixture<InstructorPending>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InstructorPending]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructorPending);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
