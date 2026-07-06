import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css'
})
export class SearchBar {
  @Output() searchChange = new EventEmitter<string>();

  searchTerm = '';

  onInput(value: string) {
    this.searchTerm = value;
    this.searchChange.emit(value);
  }
}
