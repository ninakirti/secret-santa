import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

interface Box {
  id: number;
  color: string;
  userName: string;
  revealed: boolean;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  boxes: Box[] = [];
  selectedUserName: string | null = null;
  colors = ['#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff'];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.generateBoxes();
  }

  generateBoxes(): void {
    const availableUsers = this.userService.getAvailableUsers();
    this.boxes = availableUsers.map((user, index) => ({
      id: user.id,
      color: this.colors[index % this.colors.length],
      userName: user.name,
      revealed: false,
    }));
  }

  revealBox(box: Box): void {
    if (!this.selectedUserName) { // Only allow one selection
      box.revealed = true;
      this.selectedUserName = box.userName;
      this.userService.markUserAsChosen(box.id); // Mark the chosen user as selected
    }
  }

}
