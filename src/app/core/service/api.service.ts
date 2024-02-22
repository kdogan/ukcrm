import { Injectable } from '@angular/core';
import { Contract, Counter, Customer, Note, Task, User } from '../models';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  getApiUrlFor(path:string){
    return this.apiURL+path;
  }
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

 
  
  //TASKS
  addTask(newTask:Task):Observable<Task>{
    return this.http.post<Task>(this.getApiUrlFor('tasks/add'), newTask);
  }

  getTasks():Observable<Task[]> {
    return this.http.get<Task[]>(this.getApiUrlFor('tasks'));
  }

  updateTask(updatedTask:Task):Observable<Task> {
    return this.http.put<Task>(this.getApiUrlFor('tasks/update'), updatedTask);
  }



  ////// CUSTOMER ///////////
  addCustomer(customer:Customer):Observable<Customer>{
    return this.http.post<Customer>(this.getApiUrlFor('customers/add'), customer);
  }

  getAllCustomers():Observable<Customer[]> {
    return this.http.get<Customer[]>(this.getApiUrlFor('customers'));
  }

  deleteCustomer(id: string) {
    return this.http.delete<Customer>(this.getApiUrlFor('customers/delete/'+id));
  }

  fetchNoteForCustomer(id: string) {
    return this.http.get<Note[]>(this.getApiUrlFor('customers/note/'+id));
  }

  addNote(note: Note) {
    return this.http.post<Note>(this.getApiUrlFor('customers/note/add'), note);
  }
  updateNote(note: Note) {
    return this.http.put<Note>(this.getApiUrlFor('customers/note/update/'+note._id), {text:note.text});
  }

  ////// CONTRACTS ///////////
  addContract(contract:Contract):Observable<Contract> {
    return this.http.post<Contract>(this.getApiUrlFor('contracts/add'), contract);
  }
  getAllContracts():Observable<Contract[]> {
    return this.http.get<Contract[]>(this.getApiUrlFor('contracts'));
  }
}
