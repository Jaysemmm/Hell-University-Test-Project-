import { Injectable } from '@angular/core';
import { ApiService } from './services/api';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RegistrationService {
  constructor(private api: ApiService) {}

  register(data: {
    name: string;
    email: string;
    year_level: string;
    department: string;
    age: number;
    birthday: string;
    contact_number: string;
  }): Observable<any> {
    return this.api.register(data);
  }
}
