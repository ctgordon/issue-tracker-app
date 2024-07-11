import {Component, CUSTOM_ELEMENTS_SCHEMA, OnDestroy, OnInit} from '@angular/core';
import {HttpService} from "../../services/http.service";
import {Subscription} from "rxjs";
import {Issue} from "../../models/issue";
import {NgClass, NgOptimizedImage} from "@angular/common";
import {User} from "../../models/user";
import {FilterComponent} from "../../components/filter/filter.component";
import {FilterInput} from "../../models/filter.input";
import {FilterOutput} from "../../models/filter.output";
import {MatIcon} from "@angular/material/icon";
import {FilterService} from "../../services/filter.service";

@Component({
  selector: 'app-issues',
  standalone: true,
  imports: [
    NgOptimizedImage,
    NgClass,
    FilterComponent,
    MatIcon
  ],
  templateUrl: './issues.component.html',
  styleUrl: './issues.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IssuesComponent implements OnInit, OnDestroy {
  public issues!: Issue[];
  public filteredIssues!: Issue[];
  public filters: FilterOutput[] = [];
  public categories: FilterInput[] = [
    {
      id: 'assignee',
      value: 'Assignee',
      type: 'category',
      parentId: ''
    },
    {
      id: 'status',
      value: 'Status',
      type: 'category',
      parentId: ''
    },
    {
      id: 'tag',
      value: 'Tag',
      type: 'category',
      parentId: ''
    }
  ];
  public options: FilterInput[] = [];

  private issueSubscription!: Subscription;
  private currentUser: User = {
    avatar: "", id: "12345", name: "John Doe"
  }

  constructor(private http: HttpService, private filterService: FilterService) {
  }

  ngOnInit() {
    this.getIssues();
    this.filterService.currentFilters.subscribe((filterOutput: FilterOutput) => {
      this.filters.push(filterOutput);
      this.filterIssues();
    });
  }

  getIssues() {
    this.issueSubscription = this.http.getIssues().subscribe({
      complete: () => {
        this.filterIssues();
      },
      error: (err) => {
        console.error(err);
      },
      next: (data) => {
        this.issues = data;
        this.issues.forEach(issue => {
          issue.isCurrentUser = issue.assignee.id === this.currentUser.id;

          switch (issue.status) {
            case 'IN_PROGRESS':
              issue.statusClass = 'text-success';
              break;
            case 'ON_HOLD':
              issue.statusClass = 'text-primary';
              break;
            case 'SCHEDULED_WORK':
              issue.statusClass = 'text-secondary';
              break;
          }

          let checkAssignee = this.checkArrayForObject(issue.assignee.id);

          if (!checkAssignee) {
            this.options.push({
              id: issue.assignee.id, parentId: "assignee", type: "option", value: issue.assignee.name
            });
          }

          let checkStatus = this.checkArrayForObject(issue.status);

          if (!checkStatus) {
            this.options.push({
              id: issue.status,
              parentId: 'status',
              type: 'option',
              value: issue.status
            });
          }

          if (issue.tags) {
            issue.tags.forEach(tag => {
              let checkTag = this.checkArrayForObject(tag.text);
              if (!checkTag) {
                this.options.push({
                  id: tag.text.trim().toLowerCase(),
                  parentId: 'tag',
                  type: 'option',
                  value: tag.text
                });
              }
            });
          }
        });
      }
    })
  }

  filterIssues(): void {
    if (this.filters.length === 0) {
      this.filteredIssues = this.issues;
    } else {
      this.filters.forEach(filter => {
        if (filter.category !== '' && filter.operator !== '' && filter.option !== '') {
          switch (filter.category) {
            case 'Assignee':
              this.filteredIssues = this.issues.filter(issue => {
                return this.operatorIsEqual(filter.operator) ? issue.assignee.name === filter.option : issue.assignee.name !== filter.option;
              });
              break;
            case 'Status':
              this.filteredIssues = this.issues.filter(issue => {
                return this.operatorIsEqual(filter.operator) ? issue.status === filter.option : issue.status !== filter.option;
              });
              break;
            case 'Tag':
              this.filteredIssues = this.issues.filter(issue => {
                return this.operatorIsEqual(filter.operator) ? issue.tags.find(tag =>
                  tag.text.includes(filter.option)) : issue.tags.find(tag => !tag.text.includes(filter.option));
              });
              break;
          }
        }
      });
    }
  }

  operatorIsEqual(operator: string): boolean {
    return operator === 'is';
  }

  checkArrayForObject(comparator: string): boolean {
    return this.options.find(option => option.id === comparator) !== undefined;
  }

  ngOnDestroy() {
    if (typeof this.issueSubscription !== "undefined") {
      this.issueSubscription.unsubscribe();
    }
  }
}
