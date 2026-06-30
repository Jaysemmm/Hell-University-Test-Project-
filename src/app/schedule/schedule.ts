import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule.html',
  styleUrl: './schedule.css'
})
export class Schedule implements OnInit {
  schedules = signal<any[]>([]);
  isLoading = signal(true);

  // Admin/Edit access state
  isAdmin = signal(false);
  showPinModal = signal(false);
  pin = signal('');
  pinError = signal('');
  private correctPin = '1215';

  // Create/Edit modal state
  showModal = signal(false);
  isEditing = signal(false);
  editingId: number | null = null;

  newSchedule = {
    day: '',
    start_time: '',
    end_time: '',
    room: '',
    instructor: ''
  };

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  goHome() {
    this.router.navigate(['/']);
  }

  ngOnInit() {
    this.loadSchedules();
  }

  loadSchedules() {
    this.apiService.getSchedules().subscribe({
      next: (data) => {
        this.schedules.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading schedules:', err);
        this.isLoading.set(false);
      }
    });
  }

  // ===== PIN logic =====
  openPinModal() {
    this.pin.set('');
    this.pinError.set('');
    this.showPinModal.set(true);
  }

  confirmPin() {
    if (this.pin() === this.correctPin) {
      this.isAdmin.set(true);
      this.showPinModal.set(false);
    } else {
      this.pinError.set('Incorrect PIN. Try again!');
      this.pin.set('');
    }
  }

  closePinModal() {
    this.showPinModal.set(false);
    this.pin.set('');
    this.pinError.set('');
  }

  // ===== Create/Edit logic (now requires isAdmin already true) =====
  openCreateModal() {
    this.isEditing.set(false);
    this.editingId = null;
    this.newSchedule = { day: '', start_time: '', end_time: '', room: '', instructor: '' };
    this.showModal.set(true);
  }

  openEditModal(schedule: any) {
    this.isEditing.set(true);
    this.editingId = schedule.id;
    this.newSchedule = {
      day: schedule.day,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      room: schedule.room,
      instructor: schedule.instructor
    };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveSchedule() {
    if (this.isEditing() && this.editingId !== null) {
      this.apiService.updateSchedule(this.editingId, this.newSchedule).subscribe({
        next: () => {
          this.loadSchedules();
          this.showModal.set(false);
        },
        error: (err) => console.error('Error updating schedule:', err)
      });
    } else {
      this.apiService.createSchedule(this.newSchedule).subscribe({
        next: () => {
          this.loadSchedules();
          this.showModal.set(false);
        },
        error: (err) => console.error('Error creating schedule:', err)
      });
    }
  }

  deleteSchedule(id: number) {
    if (confirm('Are you sure you want to delete this schedule?')) {
      this.apiService.deleteSchedule(id).subscribe({
        next: () => this.loadSchedules(),
        error: (err) => console.error('Error deleting schedule:', err)
      });
    }
  }
  exitAdminMode() {
  this.isAdmin.set(false);
  this.isEditing.set(false);
  this.editingId = null;
  this.showModal.set(false);
  this.showPinModal.set(false);
}
}
