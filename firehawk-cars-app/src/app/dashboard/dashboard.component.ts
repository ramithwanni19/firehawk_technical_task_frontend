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
  styleUrls: ['./dashboard.component.css'],
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
  addRecordModal: boolean = false;
  globalSearchTerm: string = '';
  showToast: boolean = false;
  toastTitle: string = '';
  toastDesc: string = '';
  showDeleteModal: boolean = false;
  carToDelete: Car | null = null;

  nextPageToken: string | null = null;
  pageHistory: (string | null)[] = [];

  tempFilters: any = this.initFilters();
  activeFilters: any = {};
  newCar: any = this.initNewCar();

  constructor(private carService: CarService, private router: Router) {}

  ngOnInit() {
    this.loadSavedFilters();
    this.loadData();
  }

  initFilters() {
    return {
      make: '',
      model: '',
      model_year: '',
      cylinders: '',
      mpg: '',
      displacement: '',
      horsepower: '',
      weight: '',
      acceleration: '',
      origin: '',
    };
  }

  initNewCar() {
    return {
      make: '',
      model: '',
      mpg: null,
      cylinders: null,
      displacement: null,
      horsepower: null,
      weight: null,
      acceleration: null,
      model_year: null,
      origin: 'usa',
    };
  }

  private saveFiltersToStorage() {
    const dataToSave = {
      active: this.activeFilters,
      global: this.globalSearchTerm,
    };
    localStorage.setItem('carRegistryFilters', JSON.stringify(dataToSave));
  }

  private loadSavedFilters() {
    const saved = localStorage.getItem('carRegistryFilters');
    if (saved) {
      const parsed = JSON.parse(saved);
      this.activeFilters = parsed.active || {};
      this.globalSearchTerm = parsed.global || '';
      this.tempFilters = { ...this.initFilters(), ...this.activeFilters };
    }
  }

  get isFormInvalid(): boolean {
    return Object.values(this.newCar).some(
      (val) => val === '' || val === null || val === undefined
    );
  }

  get isFiltering(): boolean {
    return (
      Object.keys(this.activeFilters).length > 0 ||
      this.globalSearchTerm.length > 0
    );
  }

  loadData() {
    if (this.isFiltering) {
      this.loadFilteredData();
    } else {
      this.loadBackendData();
    }
  }

  loadBackendData(pageToken: string | null = null) {
    this.carService
      .getCars(this.sortColumn, this.sortDirection, this.pageSize, pageToken)
      .subscribe({
        next: (res) => {
          this.displayCars = res.data;
          this.totalRecords = res.totalRecords;
          this.nextPageToken = res.nextPageToken;
        },
      });
  }

  loadFilteredData() {
    this.carService.filterCars().subscribe({
      next: (res) => {
        let results = [...res.data];

        Object.keys(this.activeFilters).forEach((key) => {
          const filterValue = String(this.activeFilters[key])
            .toLowerCase()
            .trim();
          if (filterValue) {
            results = results.filter((car: any) =>
              String(car[key] || '')
                .toLowerCase()
                .includes(filterValue)
            );
          }
        });

        if (this.globalSearchTerm.trim()) {
          const term = this.globalSearchTerm.toLowerCase().trim();
          results = results.filter((car: any) =>
            Object.values(car).some((value) =>
              String(value).toLowerCase().includes(term)
            )
          );
        }

        results.sort((a: any, b: any) => {
          const valA = a[this.sortColumn];
          const valB = b[this.sortColumn];
          const comp = valA > valB ? 1 : -1;
          return this.sortDirection === 'asc' ? comp : comp * -1;
        });

        this.filteredMaster = results;
        this.totalRecords = results.length;
        this.paginateFrontend();
      },
    });
  }

  paginateFrontend() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayCars = this.filteredMaster.slice(start, end);
  }

  saveNewRecord() {
    if (this.isFormInvalid) return;
    this.carService.filterCars().subscribe({
      next: (res) => {
        const allCars = res.data;
        const keysToCheck = [
          'make',
          'model',
          'mpg',
          'cylinders',
          'displacement',
          'horsepower',
          'weight',
          'acceleration',
          'model_year',
          'origin',
        ];

        const isDuplicate = allCars.some((existingCar) =>
          keysToCheck.every(
            (key) =>
              String(existingCar[key as keyof Car] || '')
                .toLowerCase()
                .trim() ===
              String(this.newCar[key] || '')
                .toLowerCase()
                .trim()
          )
        );

        if (isDuplicate) {
          alert('This exact record already exists!');
          return;
        }
        this.carService.addCar(this.newCar).subscribe({
          next: (savedCar) => {
            this.displayCars = [savedCar, ...this.displayCars];

            if (this.isFiltering) {
              this.filteredMaster = [savedCar, ...this.filteredMaster];
            }

            this.totalRecords++;
            this.triggerToast('Sucess', 'New car record added to registry.!');
            this.newCar = this.initNewCar();
            this.addRecordModal = false;
          },
          error: (err) => alert('Error saving to server: ' + err.message),
        });
      },
    });
  }

  onDelete(car: Car) {
    if (!car.id) return;
    this.carToDelete = car;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (!this.carToDelete || !this.carToDelete.id) return;

    const id = this.carToDelete.id;

    this.carService.deleteCar(id).subscribe({
      next: () => {
        this.displayCars = this.displayCars.filter((c) => c.id !== id);
        if (this.isFiltering) {
          this.filteredMaster = this.filteredMaster.filter((c) => c.id !== id);
        }
        this.totalRecords--;
        this.triggerToast('Success', 'Car record deleted from the registry.');
        this.closeModal();
      },
      error: (err) => {
        this.triggerToast('Error', 'Delete failed: ' + err.message);
        this.closeModal();
      },
    });
  }

  closeModal() {
    this.showDeleteModal = false;
    this.carToDelete = null;
  }

  onGlobalSearch() {
    this.currentPage = 1;
    this.saveFiltersToStorage();
    this.loadData();
  }

  clearGlobalSearch() {
    this.globalSearchTerm = '';
    this.saveFiltersToStorage();
    this.currentPage = 1;
    this.loadData();
  }

  applyFilters() {
    this.activeFilters = {};
    Object.keys(this.tempFilters).forEach((key) => {
      if (this.tempFilters[key])
        this.activeFilters[key] = this.tempFilters[key];
    });
    this.saveFiltersToStorage();
    this.showFilterModal = false;
    this.currentPage = 1;
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
    this.globalSearchTerm = '';
    this.tempFilters = this.initFilters();
    this.activeFilters = {};
    localStorage.removeItem('carRegistryFilters');
    this.currentPage = 1;
    this.loadData();
  }

  setSort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.currentPage = 1;
    this.loadData();
  }

  nextPage() {
    if (!this.isFiltering && this.nextPageToken) {
      this.pageHistory.push(this.displayCars[0]?.id?.toString() || null);
      this.currentPage++;
      this.loadBackendData(this.nextPageToken);
    } else if (this.isFiltering && this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginateFrontend();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      if (!this.isFiltering) {
        const prevId = this.pageHistory.pop() || null;
        this.loadBackendData(prevId);
      } else {
        this.paginateFrontend();
      }
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize) || 1;
  }
  getActiveFilterKeys() {
    return Object.keys(this.activeFilters);
  }

  formatLabel(key: string): string {
    const labels: any = { model_year: 'Year' };
    return labels[key] || key.charAt(0).toUpperCase() + key.slice(1);
  }

  triggerToast(title: string, message: string) {
    this.toastTitle = title;
    this.toastDesc = message;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  backupAllData() {
    this.carService.filterCars().subscribe({
      next: (res) => {
        const allData = res.data;
        if (!allData || allData.length === 0) {
          this.triggerToast('Info', 'No data available to backup.');
          return;
        }

        const headers = [
          'Make',
          'Model',
          'MPG',
          'Cylinders',
          'Displacement',
          'Horsepower',
          'Weight',
          'Acceleration',
          'Year',
          'Origin',
        ];

        const csvRows = [
          headers.join(','),
          ...allData.map((car) =>
            [
              `"${car.make}"`,
              `"${car.model}"`,
              car.mpg,
              car.cylinders,
              car.displacement,
              car.horsepower,
              car.weight,
              car.acceleration,
              car.model_year,
              `"${car.origin}"`,
            ].join(',')
          ),
        ];

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], {
          type: 'text/csv;charset=utf-8;',
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.setAttribute('href', url);
        link.setAttribute(
          'download',
          `registry_full_backup_${new Date().toISOString().split('T')[0]}.csv`
        );
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.triggerToast(
          'Backup Complete',
          `Successfully exported ${allData.length} records.`
        );
      },
      error: (err) => {
        this.triggerToast(
          'Error',
          'Failed to fetch backup data: ' + err.message
        );
      },
    });
  }

  onLogout() {
    localStorage.removeItem('carRegistryFilters');
    this.router.navigate(['/login']);
  }
}
