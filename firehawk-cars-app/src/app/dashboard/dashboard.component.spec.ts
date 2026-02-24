import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { CarService } from '../services/car.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';

describe('DashboardComponent Test - ', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockCarService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockCarService = jasmine.createSpyObj([
      'getCars',
      'filterCars',
      'addCar',
      'deleteCar',
    ]);
    mockRouter = jasmine.createSpyObj(['navigate']);

    mockCarService.getCars.and.returnValue(
      of({ data: [], totalRecords: 0, nextPageToken: null })
    );

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, FormsModule],
      providers: [
        { provide: CarService, useValue: mockCarService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Should disable the "Save Record" button when the form is incomplete', () => {
    component.newCar = {
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
    expect(component.isFormInvalid).toBeTrue();
    component.newCar.make = 'Ford';
    expect(component.isFormInvalid).toBeTrue();
  });

  it('Should correctly identify when a filter is active', () => {
    component.activeFilters = {};
    component.globalSearchTerm = '';
    expect(component.isFiltering).toBeFalse();

    component.globalSearchTerm = 'Mustang';
    expect(component.isFiltering).toBeTrue();

    component.globalSearchTerm = '';
    component.activeFilters = { origin: 'japan' };
    expect(component.isFiltering).toBeTrue();
  });

  it('Should toggle sort direction when the same column is clicked', () => {
    component.sortColumn = 'make';
    component.sortDirection = 'asc';
    component.setSort('make');
    expect(component.sortDirection).toBe('desc');
    component.setSort('model');
    expect(component.sortColumn).toBe('model');
    expect(component.sortDirection).toBe('asc');
  });

  it('Should clear the global search term and reset to page 1', () => {
    component.globalSearchTerm = 'Mustang';
    component.currentPage = 5;

    component.clearGlobalSearch();

    expect(component.globalSearchTerm).toBe('');
    expect(component.currentPage).toBe(1);
  });

  it('Should prevent the user from saving if the record is an exact duplicate', fakeAsync(() => {
    spyOn(window, 'alert');
    const duplicateData = {
      ...component.initNewCar(),
      make: 'Ford',
      model: 'Mustang',
      origin: 'usa',
      mpg: 20,
      cylinders: 8,
      displacement: 302,
      horsepower: 210,
      weight: 3000,
      acceleration: 10,
      model_year: 1968,
    };
    mockCarService.filterCars.and.returnValue(of({ data: [duplicateData] }));
    component.newCar = { ...duplicateData };
    component.saveNewRecord();
    tick();
    expect(window.alert).toHaveBeenCalledWith(
      'This exact record already exists!'
    );
    expect(mockCarService.addCar).not.toHaveBeenCalled();
  }));
});
