import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})


export class Home {
  showPinModal = signal (false);
  pin = signal ('');
  pinError = signal ('');

  private correctPIn = '1215';

  constructor(private router: Router) {}

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToStudents() {
    this.showPinModal.set(true);
    this.pin.set('');
    this.pinError.set('');

  }

  goToSchedule() {
  this.router.navigate(['/schedule']);
}

 confirmPin(){
  if (this.pin() === this.correctPIn){
    this.showPinModal.set(false);
    this.router.navigate(['/students']);
  } else {
    this.pinError.set('Incorrect PIN. Try again!');
    this.pin.set('');
  }
 }

 closePinModal(){
  this.showPinModal.set(false);
  this.pin.set('');
  this.pinError.set('');
 }
}

