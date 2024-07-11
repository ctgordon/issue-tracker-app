import {User} from "./user";
import {Project} from "./project";
import {Tag} from "./tag";

export interface Issue {
  title: string;
  createdBy: User;
  createdDate: string;
  modifiedBy: User;
  modifiedDate: string;
  assignee: User;
  project: Project;
  comments: Comment[];
  tags: Tag[];
  resolved: boolean;
  status: string;
  statusClass: string;
  isCurrentUser: boolean;
}
