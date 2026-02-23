import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs'; 
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface Car {
  id?: string;
  make: string;
  model: string;
  model_year: number;
  mpg: number;
  cylinders: number;      
  displacement: number;   
  horsepower: string;     
  weight: number;         
  acceleration: number;   
  origin: string;
}

export interface CarResponse {
  data: Car[];
  nextPageToken: string | null;
  totalRecords: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarService {
  private readonly API_URL = 'http://192.168.1.8:3000/api';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) throw new Error('No authentication token found.');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  getCars(
    sortBy: string, 
    direction: string, 
    limit: number, 
    lastDocId: string | null = null
  ): Observable<CarResponse> {
    try {
      const headers = this.getHeaders();
      let params = new HttpParams()
        .set('sortBy', sortBy)
        .set('direction', direction)
        .set('limit', limit.toString());
    
      if (lastDocId) params = params.set('lastDocId', lastDocId);

      return this.http.get<CarResponse>(`${this.API_URL}/all-cars`, { headers, params }).pipe(
        catchError(this.handleError)
      );
    } catch (e) {
      return throwError(() => e);
    }
  }

  filterCars(): Observable<CarResponse> {
    try {
      const headers = this.getHeaders();
      return this.http.post<CarResponse>(`${this.API_URL}/filter-cars`, {}, { headers }).pipe(
        catchError(this.handleError)
      );
    } catch (e) {
      return throwError(() => e);
    }
  }
  
  private handleError(err: any) {
    console.error('CarService Error:', err);
    return throwError(() => err);
  }

  addCar(carData: Car): Observable<Car> {
    try {
      const headers = this.getHeaders();
      return this.http.post<Car>(`${this.API_URL}/add-car`, carData, { headers }).pipe(
        catchError(this.handleError)
      );
    } catch (e) {
      return throwError(() => e);
    }
  }

  deleteCar(id: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.API_URL}/delete-car/${id}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }
}