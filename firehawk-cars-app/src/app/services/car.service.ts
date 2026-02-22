import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs'; 
import { switchMap, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface Car {
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

interface CarResponse {
  data: Car[];
  nextPageToken: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class CarService {
  private readonly API_URL = 'http://192.168.1.8:3000/api';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getCars(
    sortBy: string, 
    direction: string, 
    limit: number, 
    lastDocId: string | null = null, 
    filters: any = {}
  ): Observable<CarResponse> {
    
    return of(this.authService.getToken()).pipe(
      switchMap(token => {
        if (!token) {
          return throwError(() => new Error('No authentication token found.'));
        }
        
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });

        let params = new HttpParams()
          .set('sortBy', sortBy)
          .set('direction', direction)
          .set('limit', limit.toString());
      
        if (lastDocId) {
          params = params.set('lastDocId', lastDocId);
        }
      
        Object.keys(filters).forEach(key => {
          if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
            params = params.set(key, filters[key].toString());
          }
        });

        return this.http.get<CarResponse>(`${this.API_URL}/all-cars`, { headers, params });
      }),
      catchError(err => {
        console.error('CarService Error:', err);
        return throwError(() => err);
      })
    );
  }
}