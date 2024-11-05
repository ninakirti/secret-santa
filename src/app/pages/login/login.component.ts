import { Component } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  name = '';
  loginFailed = false;

  constructor(private userService: UserService) {}

  login(): void {
    if (!this.userService.login(this.name)) {
      this.loginFailed = true;
    }
  }
}
