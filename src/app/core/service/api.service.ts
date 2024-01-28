import { Injectable } from '@angular/core';
import { Counter, User } from '../models';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  registerUser(newUser:User) :Observable<string>{
    return this.http.post<string>(this.getApiUrlFor('register'), newUser);
  }
  login(email: string, passwd: string) {
    return this.http.post<User>(this.getApiUrlFor('login'), {email, passwd});
  }


  apiURL = 'http://localhost:3000/'
  constructor(private http: HttpClient) { }

  addCounter(newCounter:Counter):Observable<Counter>{
    return this.http.post<Counter>(this.getApiUrlFor('counter'), newCounter);
  }
  getAllCounters():Observable<Counter[]> {
    return this.http.get<Counter[]>(this.getApiUrlFor('counters'));
  }

  getApiUrlFor(path:string){
    return this.apiURL+path;
  }
}
