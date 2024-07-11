import {User} from "./user";

export interface Comment {
  id: string;
  timestamp: string;
  text: string;
  owner: User;
}
