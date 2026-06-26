import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { RegistrationService } from '../registration';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // ✅ Added

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  successMessage = '';
  errorMessage = '';
  validationMessage = '';

  registrationform = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    year_level: new FormControl('', [Validators.required]),
    age: new FormControl('', [Validators.required, Validators.min(0)]),
    birthday: new FormControl('', [Validators.required]),
    contact_number: new FormControl('', [Validators.required, Validators.minLength(11), Validators.maxLength(11)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    department: new FormControl('', [Validators.required]),
  });

  constructor(
    private regService: RegistrationService,
    private router: Router
  ) {}

  goHome() {
    this.router.navigate(['/']);
  }

  onSubmit() {
    if (this.registrationform.valid) {
      this.regService.register({
        name: this.registrationform.value.name!,
        email: this.registrationform.value.email!,
        age: Number(this.registrationform.value.age!),
        birthday: this.registrationform.value.birthday!,
        contact_number: this.registrationform.value.contact_number!,
        year_level: this.registrationform.value.year_level!,
        department: this.registrationform.value.department!,
      }).subscribe({
        next: (res) => {
          this.successMessage = 'Registered successfully!';
          this.errorMessage = '';
          this.registrationform.reset();
          console.log('Success!', res);
        },
        error: (err) => {
          this.errorMessage = 'Registration Denied. Try again.';
          this.successMessage = '';
          console.error('Error:', err);
        }
      });
    } else {
      this.errorMessage = '';
      this.validationMessage = 'Fill in all fields correctly.';
    }
  }
}
