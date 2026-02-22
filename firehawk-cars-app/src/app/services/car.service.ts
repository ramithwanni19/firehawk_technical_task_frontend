import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

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

@Injectable({
  providedIn: 'root'
})

export class CarService {
constructor(private http: HttpClient) {}
cars: Car[] = [];
getCars() : Observable<any[]> {
  return this.http.get<any[]>('http://192.168.1.8:3000/api/all-cars');
}
}