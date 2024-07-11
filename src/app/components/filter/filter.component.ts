import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  inject,
  Input,
  model,
  OnInit,
  Output,
  signal
} from '@angular/core';
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {LiveAnnouncer} from "@angular/cdk/a11y";
import {MatChipGrid, MatChipInput, MatChipInputEvent, MatChipRow, MatChipsModule} from "@angular/material/chips";
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
  MatOption
} from "@angular/material/autocomplete";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatFormField} from "@angular/material/form-field";
import {MatIcon} from "@angular/material/icon";
import {FilterInput} from "../../models/filter.input";
import {FilterOutput} from "../../models/filter.output";
import {FilterService} from "../../services/filter.service";

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [
    FormsModule,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatChipGrid,
    MatChipInput,
    MatChipsModule,
    MatChipRow,
    MatFormField,
    MatIcon,
    MatOption,
    ReactiveFormsModule
  ],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FilterComponent implements OnInit {
  @Input() categories!: FilterInput[];
  @Input() options!: FilterInput[];

  public operators: FilterInput[] = [
    {
      id: 'is',
      value: 'is',
      type: 'operator',
      parentId: ''
    },
    {
      id: 'not',
      value: 'is not',
      type: 'operator',
      parentId: ''
    },
  ];

  public currentFilter = model('');
  public separatorKeysCodes: number[] = [ENTER, COMMA];
  public currentOptions: Array<{ value: any, label: string }> = [];
  public filterOutput: FilterOutput = {category: "", operator: "", option: ""};

  readonly announcer = inject(LiveAnnouncer);
  readonly filters = signal(['All issues']);

  private categoryId: string = '';

  constructor(private filterService: FilterService) {
  }

  ngOnInit() {
    this.populateCategories();
  }

  populateCategories(): void {
    this.currentOptions = [];
    this.categories.forEach(category => {
      this.currentOptions.push({value: category, label: category.value});
    });
  }

  populateOperators(): void {
    this.currentOptions = [];
    this.operators.forEach(operator => {
      this.currentOptions.push({value: operator, label: operator.value});
    });
  }

  populateOptions(): void {
    this.currentOptions = [];
    this.options.forEach(option => {
      if (option.parentId === this.categoryId) {
        this.currentOptions.push({value: option, label: option.value});
      }
    });
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.filters.update(filters => [...filters, value]);
    }
    this.currentFilter.set('');
  }

  remove(filter: string): void {
    // ToDo: When chip is removed, find parentId, populate currentMenu with parent options
    // ToDo: e.g if an assignee name is removed, currentMenu will be propagated by list of assignees
    // ToDo: Update current filter too
    // ToDo: Update consumers using signal
    this.filters.update(filters => {
      const index = filters.indexOf(filter);
      if (index < 0) {
        return filters;
      }

      filters.splice(index, 1);
      this.announcer.announce(`Removed ${filter}`);
      return [...filters];
    });
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    if (event.option.value) {
      const type = event.option.value.type;
      switch (type) {
        case 'category':
          this.categoryId = event.option.value.id;
          this.filterOutput.category = event.option.value.value;
          this.populateOperators();
          break;
        case 'operator':
          this.filterOutput.operator = event.option.value.value;
          this.populateOptions();
          break;
        case 'option':
          this.filterOutput.option = event.option.value.value;
          this.populateCategories();
          break;
      }
    }

    // ToDo: Filter can be saved to local storage or persisted to database via API
    if (this.filterOutput.category && this.filterOutput.operator && this.filterOutput.option) {
      this.filterService.currentFilters.next(this.filterOutput);
    }

    this.filters.update(filters => [...filters, event.option.viewValue]);
    this.currentFilter.set('');

    event.option.deselect();
  }
}
