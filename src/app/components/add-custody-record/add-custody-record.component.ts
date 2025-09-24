import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AddrecordService } from '../../servies/addrecord.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-add-custody-record',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './add-custody-record.component.html',
  styleUrl: './add-custody-record.component.css'
})
export class AddCustodyRecordComponent {
  custodyForm: FormGroup;
  submitted = false;

  constructor(private fb: FormBuilder, private recordservice:AddrecordService) {
    this.custodyForm = this.fb.group({
      notes: ['', [Validators.required, Validators.maxLength(500)]],
      file: [null, Validators.required],
      date: ['', Validators.required] // حقل التاريخ
    });
  }

  get f() {
    return this.custodyForm.controls;
  }

  handleFileInput(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.custodyForm.patchValue({ file: reader.result });
    };
    reader.readAsDataURL(file);
  }

  onSubmit() {
    this.submitted = true;

    if (this.custodyForm.invalid) {
      return;
    }

    const record = {
      id: this.generateId(),
      notes: this.custodyForm.value.notes,
      file: this.custodyForm.value.file,
      date: this.custodyForm.value.date // التاريخ اللي اختاره اليوزر
    };

    this.recordservice.addallrecord(record.date,record.notes,record.file)
      .subscribe({
        next: () => {
          alert('تم حفظ بيانات العهدة بنجاح');
          this.custodyForm.reset();
          this.submitted = false;
        },
        error: (error) => {
          alert('حدث خطأ أثناء حفظ البيانات');
        }
      });
  }

  private generateId(): string {
    return 'item-' + Math.random().toString(36).substr(2, 9);
  }
}
