import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {


  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}


  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    return throwError(() => error);
  }


  register(data: {
    name: string;
    email: string;
    year_level: string;
    department: string;
    age: number;
    birthday: string;
    contact_number: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data)
      .pipe(catchError(this.handleError));
  }


  getStudents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/students`)
      .pipe(catchError(this.handleError));
  }


  updateStudent(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/students/${id}`, data)
      .pipe(catchError(this.handleError));
  }


  deleteStudent(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/students/${id}`)
      .pipe(catchError(this.handleError));
  }
}
