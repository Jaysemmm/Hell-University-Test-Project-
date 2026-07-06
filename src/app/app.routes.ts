import { Routes } from '@angular/router';
import { Register } from './register/register';
import { Home } from './home/home';
import { Students } from './student-list/student-list';
import { Schedule } from './schedule/schedule';
import { StudentReport } from './student-report/student-report';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'register', component: Register },
  { path: 'students', component: Students },
  { path: 'schedule', component: Schedule},
  { path: 'form', component: StudentReport }
];
