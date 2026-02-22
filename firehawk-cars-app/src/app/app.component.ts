import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarService } from './services/car.service';

// Define the structure of our car data to satisfy TypeScript
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
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [CarService], 
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  // Use the interface here to prevent the "Object vs Array" error
  cars: Car[] = []; 
  searchTerm: string = '';
  
  // Pagination Variables
  currentPage: number = 1;
  pageSize: number = 10; // Increased to 10 for better display of 398 records

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

  // Filter logic: This runs every time 'searchTerm' changes
  get filteredCars(): Car[] {
    if (!this.searchTerm) return this.cars;
    
    const term = this.searchTerm.toLowerCase();
    return this.cars.filter(car => 
      car.make.toLowerCase().includes(term) ||
      car.model.toLowerCase().includes(term) ||
      car.origin.toLowerCase().includes(term)
    );
  }

  // Slices the filtered list for the current page
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

  // Reset pagination when searching
  onSearchChange() {
    this.currentPage = 1;
  }
}