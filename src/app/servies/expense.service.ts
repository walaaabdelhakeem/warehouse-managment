import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  private baseUrl = 'http://localhost:5000/api/';

  constructor(private http: HttpClient) {}

   // وحدات
  getUnits(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Units`);
  }

  updateUnitRecipients(unitId: number, updatedUnit: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/Units/${unitId}`, updatedUnit);
  }

  // العناصر
  getItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Items`);
  }

  // المصروفات
  getExpenses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/UnitsExpense`);
  }

  addExpense(expense: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/UnitsExpense`, expense);
  }

  // الأرصدة الافتتاحية
  getOpeningBalances(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Orders`);
  }

  updateOpeningBalance(balanceId: number, updatedBalance: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/Orders/${balanceId}`, updatedBalance);
  }
}
