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
  totalRecords: number = 0;
  nextPageToken: string | null = null;
  pageHistory: string[] = []; 
  currentPage: number = 1;
  pageSize: number = 10;
  sortColumn: string = ''; 
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
  get isFiltering(): boolean {
    return Object.keys(this.activeFilters).length > 0;
  }
  loadCars(pageToken?: string | null) {
    const filtering = this.isFiltering;

    const carObservable = filtering
      ? this.carService.filterCars(
          '',               
          'asc', 
          this.pageSize,
          pageToken,
          this.activeFilters
        )
      : this.carService.getCars(
          this.sortColumn,  
          this.sortDirection,
          this.pageSize,
          pageToken
        );

    carObservable.subscribe({
      next: (response) => {
        this.cars = response.data;
        this.totalRecords = response.totalRecords;
        this.nextPageToken = response.nextPageToken;
      },
      error: (err) => {
        console.error('Error fetching car data:', err);
      }
    });
  }

  setSort(column: string) {
    if (this.isFiltering) return;

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

  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize) || 1;
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
    this.nextPageToken = null;
    this.loadCars();
  }

  isFieldDisabled(fieldName: string): boolean {
    return Object.keys(this.tempFilters).some(key => 
      key !== fieldName && 
      this.tempFilters[key] !== null && 
      this.tempFilters[key] !== '' && 
      this.tempFilters[key] !== undefined
    );
  }
}