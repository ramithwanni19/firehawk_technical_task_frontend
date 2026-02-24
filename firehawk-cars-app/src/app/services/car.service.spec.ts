import { TestBed } from '@angular/core/testing';
import { CarService } from './car.service';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('CarService', () => {
  let service: CarService;
  let httpMock: HttpTestingController;
  let mockAuthService: any;

  beforeEach(() => {
    mockAuthService = {
      getToken: jasmine.createSpy('getToken').and.returnValue('fake-jwt-token'),
    };

    TestBed.configureTestingModule({
      providers: [
        CarService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: mockAuthService },
      ],
    });

    service = TestBed.inject(CarService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should include Authorization header in requests', () => {
    service.getCars('make', 'asc', 10).subscribe();
    const req = httpMock.expectOne((request) =>
      request.url.includes('/all-cars')
    );
    expect(req.request.headers.has('Authorization')).toBeTrue();
    expect(req.request.headers.get('Authorization')).toBe(
      'Bearer fake-jwt-token'
    );

    req.flush({ data: [], totalRecords: 0, nextPageToken: null });
  });

  it('should send a POST request to add a car', () => {
    const newCar = { make: 'Tesla', model: 'S', model_year: 2024 } as any;
    service.addCar(newCar).subscribe((response) => {
      expect(response).toEqual(newCar);
    });
    const req = httpMock.expectOne((request) =>
      request.url.includes('/add-car')
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newCar);

    req.flush(newCar);
  });
});
