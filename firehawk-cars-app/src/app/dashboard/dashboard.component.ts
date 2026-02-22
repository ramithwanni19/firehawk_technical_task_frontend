import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarService } from '../services/car.service';

interface Car {
  id?: string;
  make: string;
  model: string;
  year: number;
  mpg: number;
  cylinders: number;
  displacement: number;
  horsepower: string;
  weight: number;
  acceleration: number;
  origin: string;
}

@Component({
  selector: 'app-dashboard', 
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  cars: Car[] = []; 
  searchTerm: string = '';
  
  currentPage: number = 1;
  pageSize: number = 10;

  constructor(private carService: CarService) {}

  ngOnInit() {
    this.loadCars();
  }

  loadCars() {
    this.carService.getCars().subscribe({
      next: (data: Car[]) => {
        this.cars = data;
        console.log('Successfully loaded ' + this.cars.length + ' cars from Backend');
      },
      error: (err) => {
        console.error('Backend server error:', err);
        alert('Could not connect to the Backend Server. Make sure "node server.js" is running!');
      }
    });
  }

  get paginatedCars(): Car[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredCars.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    const pages = Math.ceil(this.filteredCars.length / this.pageSize);
    return pages > 0 ? pages : 1;
  }

  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.currentPage = newPage;
    }
  }

  onSearchChange() {
    this.currentPage = 1;
  }

sortColumn: keyof Car | '' = ''; 
sortDirection: 'asc' | 'desc' = 'asc';

setSort(column: keyof Car) {
  if (this.sortColumn === column) {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.sortColumn = column;
    this.sortDirection = 'asc';
  }
}

get filteredCars(): Car[] {
  let filtered = this.cars;


  if (this.searchTerm) {
    const term = this.searchTerm.toLowerCase();
    filtered = filtered.filter(car => 
      car.make.toLowerCase().includes(term) ||
      car.model.toLowerCase().includes(term) ||
      car.origin.toLowerCase().includes(term)
    );
  }

  if (this.sortColumn) {
    filtered = [...filtered].sort((a, b) => {
      const valA = a[this.sortColumn as keyof Car];
      const valB = b[this.sortColumn as keyof Car];

      if (valA === valB) return 0;
      
      const comparison = valA! > valB! ? 1 : -1;
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  return filtered;
}
}