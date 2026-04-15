import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructorUpload } from './instructor-upload';

describe('InstructorUpload', () => {
  let component: InstructorUpload;
  let fixture: ComponentFixture<InstructorUpload>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InstructorUpload]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructorUpload);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
