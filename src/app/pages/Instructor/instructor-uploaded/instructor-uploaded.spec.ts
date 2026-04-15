import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructorUploaded } from './instructor-uploaded';

describe('InstructorUploaded', () => {
  let component: InstructorUploaded;
  let fixture: ComponentFixture<InstructorUploaded>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InstructorUploaded]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructorUploaded);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
