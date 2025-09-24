import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AddrecordService {
url:string="http://localhost:3000/"
  constructor(private http:HttpClient) { }

 addallrecord(date: string, notes: string, file?: any):Observable<any> {
  const body: any = { date, notes };

  if (file) {
    body.file = file; // هيتبعت بس لو موجود
  }

  return this.http.post(`${this.url}CustodayRecord`, body);
}
getallrecord(): Observable<any[]>{
 return this.http.get<any[]>(`${this.url}CustodayRecord`)
}
}
