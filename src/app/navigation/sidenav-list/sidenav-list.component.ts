import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-sidenav-list',
  templateUrl: './sidenav-list.component.html',
  styleUrls: ['./sidenav-list.component.scss']
})
export class SidenavListComponent implements OnInit, OnDestroy {

  @Output() closeSidenav = new EventEmitter<void> ();

  authSubscription: Subscription;
  isAuth = false;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.authSubscription = this.authService.authChange.subscribe(authStatus => {
      this.isAuth = authStatus;
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  onClose() {
    this.closeSidenav.emit();
  }
  onLogout() {
    this.onClose();
    this.authService.logout();
  }
}
