import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
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
  private readonly API_URL = 'http://192.168.1.8:3000/api/all-cars';

  constructor(private http: HttpClient, private authService: AuthService) {}

  /**
   * @param sortBy Field to sort by (default: 'make')
   * @param direction 'asc' or 'desc'
   * @param limit Number of items per page
   * @param lastDocId The ID of the last item from the previous page
   */
  getCars(
    sortBy: string = 'make',
    direction: 'asc' | 'desc' = 'asc',
    limit: number = 10,
    lastDocId?: string
  ): Observable<CarResponse> {
    
    const token = this.authService.getToken();
    const headers = { 'Authorization': `Bearer ${token}` };

    let params = new HttpParams()
      .set('sortBy', sortBy)
      .set('direction', direction)
      .set('limit', limit.toString());

    if (lastDocId) {
      params = params.set('lastDocId', lastDocId);
    }

    return this.http.get<CarResponse>(this.API_URL, { headers, params });
  }
}