import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ItemsService {
  private apiurl = 'http://localhost:5000/api/';

  constructor(private http: HttpClient) {}

  Getallitems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiurl}Items`);
  }

  addallitems(itemName: string, stockNumber: number): Observable<any> {
    return this.http.post(`${this.apiurl}Items`, { itemName, stockNumber });
  }

  updateitem(id: any, itemName: string, stockNumber: number): Observable<any> {
    return this.http.put(`${this.apiurl}Items/${id}`, { itemName, stockNumber });
  }

  deleteitem(id: any): Observable<any> {
    return this.http.delete(`${this.apiurl}Items/${id}`);
  }
}
