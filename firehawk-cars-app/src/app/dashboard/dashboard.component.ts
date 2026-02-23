import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarService, Car } from '../services/car.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  cars: Car[] = [];
  nextPageToken: string | null = null;
  pageHistory: string[] = [];
  
  currentPage: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;
  sortColumn: string = 'make'; 
  sortDirection: 'asc' | 'desc' = 'asc';

  showFilterModal: boolean = false;

  tempFilters: any = {
    make: '',
    model: '',
    model_year: '',
    cylinders: '',
    mpg: '',
    displacement: '',
    horsepower: '',
    weight: '',
    acceleration: '',
    origin: ''
  };

  activeFilters: any = {};

  constructor(private carService: CarService) {}

  ngOnInit() {
    this.loadCars();
  }

  loadCars(pageToken?: string) {
    this.carService.getCars(
      this.sortColumn, 
      this.sortDirection, 
      this.pageSize, 
      pageToken, 
      this.activeFilters
    ).subscribe({
      next: (response) => {
        this.cars = response.data;
        this.totalRecords = response.totalRecords;
        this.nextPageToken = response.nextPageToken;
      },
      error: (err) => console.error('Backend search error:', err)
    });
  }

  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize) || 1;
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

  applyFilters() {
    this.activeFilters = {};
    Object.keys(this.tempFilters).forEach(key => {
      const val = this.tempFilters[key];
      if (val !== '' && val !== null && val !== undefined) {
        this.activeFilters[key] = typeof val === 'string' ? val.trim() : val;
      }
    });

    this.showFilterModal = false;
    this.resetPagination();
  }

  clearFilters() {
    this.tempFilters = {
      make: '', model: '', model_year: '', cylinders: '',
      mpg: '', displacement: '', horsepower: '',
      weight: '', acceleration: '', origin: ''
    };
    this.applyFilters();
  }

  removeFilter(key: string) {
    delete this.activeFilters[key];
    this.tempFilters[key] = '';
    this.resetPagination();
  }

  getActiveFilterKeys(): string[] {
    return Object.keys(this.activeFilters);
  }

  formatLabel(key: string): string {
    const labels: any = {
      make: 'Make',
      model: 'Model',
      model_year: 'Year',
      cylinders: 'Cyl',
      mpg: 'MPG',
      horsepower: 'HP',
      displacement: 'Disp',
      weight: 'Weight',
      acceleration: 'Acc',
      origin: 'Origin'
    };
    return labels[key] || key;
  }

  nextPage() {
    if (this.nextPageToken) {
      const currentFirstId = this.cars[0]?.id;
      if (currentFirstId) this.pageHistory.push(currentFirstId);
      this.currentPage++;
      this.loadCars(this.nextPageToken);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      const prevId = this.pageHistory.pop();
      this.loadCars(prevId);
    }
  }

  resetPagination() {
    this.currentPage = 1;
    this.pageHistory = [];
    this.loadCars();
  }
}