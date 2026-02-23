import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarService, Car } from '../services/car.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, TitleCasePipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  displayCars: Car[] = [];          
  private filteredMaster: Car[] = []; 
  
  totalRecords: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  sortColumn: string = 'make';      
  sortDirection: 'asc' | 'desc' = 'asc';
  showFilterModal: boolean = false;
  
  nextPageToken: string | null = null;
  pageHistory: (string | null)[] = []; 

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

  constructor(private carService: CarService, private router: Router) {}

  ngOnInit() {
    this.loadSavedFilters(); // Load persisted filters from localStorage
    this.loadData();
  }

  private saveFiltersToStorage() {
    localStorage.setItem('carRegistryFilters', JSON.stringify(this.activeFilters));
  }

  private loadSavedFilters() {
    const saved = localStorage.getItem('carRegistryFilters');
    if (saved) {
      this.activeFilters = JSON.parse(saved);
      this.tempFilters = { ...this.tempFilters, ...this.activeFilters };
    }
  }
  get isFiltering(): boolean {
    return Object.keys(this.activeFilters).length > 0;
  }

  loadData() {
    if (this.isFiltering) {
      this.loadFilteredData();
    } else {
      this.loadBackendData();
    }
  }

  loadBackendData(pageToken: string | null = null) {
    this.carService.getCars(this.sortColumn, this.sortDirection, this.pageSize, pageToken)
      .subscribe({
        next: (res) => {
          this.displayCars = res.data;
          this.totalRecords = res.totalRecords;
          this.nextPageToken = res.nextPageToken;
        }
      });
  }

  loadFilteredData() {
    this.carService.filterCars().subscribe({
      next: (res) => {
        let results = [...res.data];

        Object.keys(this.activeFilters).forEach(key => {
          const filterValue = String(this.activeFilters[key]).toLowerCase().trim();
          if (filterValue) {
            results = results.filter((car: any) => 
              String(car[key] || '').toLowerCase().includes(filterValue)
            );
          }
        });

        results.sort((a: any, b: any) => {
          const valA = a[this.sortColumn];
          const valB = b[this.sortColumn];
          const comp = valA > valB ? 1 : -1;
          return this.sortDirection === 'asc' ? comp : comp * -1;
        });

        this.filteredMaster = results;
        this.totalRecords = results.length;
        this.paginateFrontend(); 
      }
    });
  }

  paginateFrontend() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayCars = this.filteredMaster.slice(start, end);
  }

  nextPage() {
    if (!this.isFiltering && this.nextPageToken) {
      const currentFirstId = this.displayCars[0]?.id ?? null;
      this.pageHistory.push(currentFirstId);
      this.currentPage++;
      this.loadBackendData(this.nextPageToken);
    } else if (this.isFiltering && this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginateFrontend();
    }
  }

  prevPage() {
    if (!this.isFiltering && this.currentPage > 1) {
      const prevId = this.pageHistory.pop() ?? null;
      this.currentPage--;
      this.loadBackendData(prevId);
    } else if (this.isFiltering && this.currentPage > 1) {
      this.currentPage--;
      this.paginateFrontend();
    }
  }

  setSort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.currentPage = 1;
    this.pageHistory = [];
    
    if (this.isFiltering) {
      this.loadFilteredData(); 
    } else {
      this.loadBackendData();
    }
  }

  applyFilters() {
    this.activeFilters = {};
    Object.keys(this.tempFilters).forEach(key => {
      if (this.tempFilters[key]) {
        this.activeFilters[key] = this.tempFilters[key];
      }
    });

    this.saveFiltersToStorage(); // Persist to browser
    this.showFilterModal = false;
    this.currentPage = 1;
    this.pageHistory = [];
    this.loadData();
  }

  removeFilter(key: string) {
    delete this.activeFilters[key];
    this.tempFilters[key] = '';
    this.saveFiltersToStorage();
    this.currentPage = 1;
    this.loadData();
  }

  clearFilters() {
    this.tempFilters = { 
      make: '', model: '', model_year: '', cylinders: '', 
      mpg: '', displacement: '', horsepower: '', 
      weight: '', acceleration: '', origin: '' 
    };
    this.activeFilters = {};
    localStorage.removeItem('carRegistryFilters');
    this.currentPage = 1;
    this.loadData();
  }

  get totalPages(): number { 
    return Math.ceil(this.totalRecords / this.pageSize) || 1; 
  }

  getActiveFilterKeys() { 
    return Object.keys(this.activeFilters); 
  }
  
  formatLabel(key: string): string {
    const labels: any = { 
      make: 'Make', 
      model: 'Model', 
      model_year: 'Year', 
      origin: 'Origin',
      mpg: 'MPG',
      cylinders: 'Cylinders',
      displacement: 'Displacement',
      horsepower: 'Horsepower',
      weight: 'Weight',
      acceleration: 'Acceleration'
    };
    return labels[key] || key;
  }

  onLogout() {
    localStorage.removeItem('carRegistryFilters');
    this.router.navigate(['/login']);
  }
}