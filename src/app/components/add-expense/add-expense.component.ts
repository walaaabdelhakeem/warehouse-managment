import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ExpenseService } from '../../servies/expense.service';

@Component({
  selector: 'app-add-expense',
  imports: [ReactiveFormsModule],
  templateUrl: './add-expense.component.html',
  styleUrl: './add-expense.component.css'
})
export class AddExpenseComponent implements OnInit {

  addExpenseForm: FormGroup;
  expenses: any[] = [];
  availableItems: any[] = [];
  availableUnits: any[] = [];
  recipients: any[] = [];
  successMessage = '';
  errorMessage = '';
  existingDocumentNumbers: string[] = [];
  globalTransferDate = '';

  constructor(private fb: FormBuilder, private expenseService: ExpenseService) {
    this.addExpenseForm = this.fb.group({
      unitName: ['', Validators.required],
      items: this.fb.array([]),
      receiver: ['', Validators.required],
      type: ['', Validators.required],
      documentNumber: ['', this.documentNumberValidator.bind(this)],
      attachment: [null, Validators.required],
      newReceiver: [''],
      dateForm: this.fb.group({
        day: ['', [Validators.required, Validators.min(1), Validators.max(31)]],
        month: ['', [Validators.required, Validators.min(1), Validators.max(12)]],
        year: ['', [Validators.required, Validators.min(1900), Validators.max(2100)]],
      })
    });
  }

  get items(): FormArray {
    return this.addExpenseForm.get('items') as FormArray;
  }

  ngOnInit(): void {
    const today = new Date();
    this.globalTransferDate = this.formatGregorianDate(today);
    this.loadExpenses();
    this.fetchUnits();
    this.fetchItems();
  }
  formatGregorianDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  fetchItems(): void {
    this.expenseService.getItems().subscribe({
      next: (data) => (this.availableItems = data),
      error: (err) => console.error('Error fetching items:', err)
    });
  }

  fetchUnits(): void {
    this.expenseService.getUnits().subscribe({
      next: (data) => (this.availableUnits = data),
      error: (err) => console.error('Error fetching units:', err)
    });
  }
  addItem(item: any): void {
    this.items.push(this.fb.group({
      itemName: [item.itemName, [Validators.required]],
      quantity: [null, [Validators.required, Validators.min(1)]]
    }));
  }
  handleFileInput(event: any): void {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.addExpenseForm.patchValue({ attachment: reader.result });
    };
    reader.readAsDataURL(file);
  }
  loadExpenses(): void {
    this.expenseService.getExpenses().subscribe({
      next: (data) => {
        this.expenses = data
          .map(exp => ({
            ...exp,
            displayDate: this.formatDateToDDMMYYYY(
              new Date(exp.date).getDate(),
              new Date(exp.date).getMonth() + 1,
              new Date(exp.date).getFullYear()
            )
          }))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        this.existingDocumentNumbers = this.expenses
          .filter(exp => exp.type === 'نموذج صرف' && exp.documentNumber)
          .map(exp => exp.documentNumber.toString());
      },
      error: (err) => console.error('Error loading expenses:', err)
    });
  }

  saveExpense(): void {
    const dateFormGroup = this.addExpenseForm.get('dateForm') as FormGroup;
    if (dateFormGroup?.invalid) {
      alert('من فضلك أدخل تاريخ صحيح');
      return;
    }


    const { day, month, year } = this.addExpenseForm.get('dateForm')?.value;
    const dbDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    if (this.addExpenseForm.valid) {
      const newExpense = { ...this.addExpenseForm.value, date: dbDate };

      this.expenseService.addExpense(newExpense).subscribe({
        next: () => {
          this.successMessage = 'تم إضافة المصروف بنجاح';
          this.resetForm();
          this.loadExpenses();
          setTimeout(() => (this.successMessage = ''), 3000);
        },
        error: (err) => {
          this.errorMessage = 'حدث خطأ أثناء إضافة المصروف';
          console.error('Error saving expense:', err);
          setTimeout(() => (this.errorMessage = ''), 3000);
        }
      });
    }
  }

  // باقي الفانكشنز (validators, addNewRecipient, updateOpeningBalancesAfterExpense...) زي ما هي
  // بس بدل ما تستخدمي this.http، تستخدمي expenseService
  // ✅ زي ما عملنا في loadExpenses و fetchUnits



  documentNumberValidator(control: AbstractControl): ValidationErrors | null {
    const selectedType = this.addExpenseForm?.get('type')?.value;
    const enteredNumber = control.value?.toString().trim();

    if (selectedType === 'نموذج صرف' && this.existingDocumentNumbers.includes(enteredNumber)) {
      return { duplicateDocumentNumber: true };
    }

    return null;
  }

  resetForm(): void {
    this.addExpenseForm.reset({
      unitName: '',
      newReceiver: '',
      items: this.fb.array([]),
      receiver: '',
      type: '',
      documentNumber: '',
      attachment: null,
      dateForm: {
        day: '',
        month: '',
        year: ''
      }
    });
      (this.addExpenseForm.get('items') as FormArray).clear();

  }


  onUnitChange() {
    const selectedUnitName = this.addExpenseForm.get('unitName')?.value;
    const selectedUnit = this.availableUnits.find(unit => unit.unitName === selectedUnitName);

    if (selectedUnit) {
      // التأكد من وجود مصفوفة recipients
      if (!Array.isArray(selectedUnit.recipients)) {
        selectedUnit.recipients = [];
      }

      this.recipients = [...selectedUnit.recipients];
      this.addExpenseForm.get('receiver')?.enable();
      this.addExpenseForm.get('receiver')?.setValidators([Validators.required]);
      this.addExpenseForm.get('receiver')?.updateValueAndValidity();
    } else {
      this.recipients = [];
      this.addExpenseForm.get('receiver')?.disable();
      this.addExpenseForm.get('receiver')?.clearValidators();
      this.addExpenseForm.get('receiver')?.updateValueAndValidity();
    }

  }

  onTypeChange() {
    const selectedType = this.addExpenseForm.get('type')?.value;
    const docControl = this.addExpenseForm.get('documentNumber');

    if (selectedType === 'نموذج صرف') {
      docControl?.enable();
      docControl?.setValidators([
        Validators.required,
        this.documentNumberValidator.bind(this)
      ]);
    } else {
      docControl?.disable();
      docControl?.clearValidators();
    }

    docControl?.updateValueAndValidity();
  }

  async updateOpeningBalancesAfterExpense(items: any[]) {
    this.expenseService.getOpeningBalances().subscribe({
      next: (openingBalances) => {
        for (const item of items) {
          const matched = openingBalances.find((b: any) => b.itemName === item.itemName);
          if (matched) {
            const updatedBalance = {
              ...matched,
              quantityAvailable: Math.max(
                0,
                Number(matched.quantityAvailable || 0) - Number(item.quantity || 0)
              )
            };

            this.expenseService.updateOpeningBalance(matched.id, updatedBalance).subscribe({
              next: () => console.log(`Opening balance updated for ${item.itemName}`),
              error: (err) => console.error('Error updating opening balance:', err)
            });
          }
        }
      },
      error: (err) => console.error('Error fetching opening balances:', err)
    });
  }


  formatDateToDDMMYYYY(day: number, month: number, year: number): string {
    const dd = String(day).padStart(2, '0');
    const mm = String(month).padStart(2, '0');
    const yyyy = String(year);
    return `${dd}/${mm}/${yyyy}`;
  }

}
