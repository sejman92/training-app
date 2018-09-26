import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { UIService } from '../../shared/ui.service';
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as fromApp from '../../app.reducer';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loadingSub: Subscription;
  isLoading$: Observable<boolean>;
  loginForm: FormGroup;
  constructor(private authService: AuthService, private uiService: UIService, private store: Store<{ui: fromApp.State}>) { }

  ngOnInit() {
    this.isLoading$ = this.store.pipe(map(state => state.ui.isLoading));
    // this.loadingSub = this.uiService.loadingStateChanged.subscribe(value => {
    //   this.isLoading = value;
    // });
    this.loginForm = new FormGroup({
      email: new FormControl('',
       { validators: [Validators.required, Validators.email]}),
      password: new FormControl('',
       { validators: [Validators.required]})
    });
  }

  // ngOnDestroy() {
  //   // if (this.loadingSub) {
  //   //   this.loadingSub.unsubscribe();
  //   // }
  // }
  onLogin() {
    this.authService.login({
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    });
  }
}

