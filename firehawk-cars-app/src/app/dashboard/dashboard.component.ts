import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarService, Car } from '../services/car.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  cars: Car[] = [];
  nextPageToken: string | null = null;
  
  pageHistory: string[] = []; 
  
  searchTerm: string = '';
  pageSize: number = 10;
  sortColumn: string = 'make'; 
  sortDirection: 'asc' | 'desc' = 'asc';
  currentPage: number = 1;

  constructor(private carService: CarService) {}

  ngOnInit() {
    this.loadCars();
  }

  loadCars(pageToken?: string) {
    this.carService.getCars(this.sortColumn, this.sortDirection, this.pageSize, pageToken)
      .subscribe({
        next: (response) => {
          this.cars = response.data;
          this.nextPageToken = response.nextPageToken;
          console.log(`Loaded ${this.cars.length} cars from Backend`);
        },
        error: (err) => {
          console.error('Backend error:', err);
          alert('Could not connect to the Backend Server.');
        }
      });
  }

  setSort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.resetPagination();
  }

  nextPage() {
    if (this.nextPageToken) {
      // Save current "start" point so we can go back
      const currentId = this.cars[0]?.id;
      if (currentId) this.pageHistory.push(currentId); 
      
      this.currentPage++;
      this.loadCars(this.nextPageToken);
    }
  }

  // Note: Firestore pagination is forward-only by default. 
  // To go back properly, we usually re-fetch from the start or use history.
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.pageHistory.pop();
      const prevId = this.pageHistory[this.pageHistory.length - 1];
      this.loadCars(prevId);
    }
  }

  resetPagination() {
    this.currentPage = 1;
    this.pageHistory = [];
    this.loadCars();
  }

  // For Search: Firestore doesn't support partial text search (like "contains") 
  // natively without a 3rd party like Algolia. 
  // For now, we search within the CURRENTly loaded page.
  get filteredCars(): Car[] {
    if (!this.searchTerm) return this.cars;
    const term = this.searchTerm.toLowerCase();
    return this.cars.filter(car => 
      car.make.toLowerCase().includes(term) ||
      car.model.toLowerCase().includes(term)
    );
  }
}