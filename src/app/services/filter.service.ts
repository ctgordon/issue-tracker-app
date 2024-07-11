import { Injectable } from '@angular/core';
import {Subject} from "rxjs";
import {FilterOutput} from "../models/filter.output";

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  public currentFilters:Subject<FilterOutput> = new Subject();
  constructor() { }
}
