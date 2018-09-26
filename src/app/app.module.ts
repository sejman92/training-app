import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { AngularFireModule } from 'angularfire2';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { MaterialModule } from './material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { WelcomeComponent } from './welcome/welcome.component';
import { HeaderComponent } from './navigation/header/header.component';
import { SidenavListComponent } from './navigation/sidenav-list/sidenav-list.component';
import { AuthService } from './auth/auth.service';
import { TrainingService } from './training/training.service';

import { environment } from '../environments/environment';
import { UIService } from './shared/ui.service';
import { AuthModule } from './auth/auth.module';
import { AngularFirestoreModule } from 'angularfire2/firestore';

import {StoreModule} from '@ngrx/store';
import {appReducer} from './app.reducer';

@NgModule({
   declarations: [
      AppComponent,
      WelcomeComponent,
      HeaderComponent,
      SidenavListComponent,
   ],
   imports: [
      BrowserModule,
      BrowserAnimationsModule,
      AppRoutingModule,
      MaterialModule,
      FlexLayoutModule,
      AngularFireModule.initializeApp(environment.firebase),
      AngularFirestoreModule,
      AuthModule,
      StoreModule.forRoot({ui: appReducer})
   ],
   providers: [
       AuthService,
       TrainingService,
       UIService
    ],
   bootstrap: [
      AppComponent
   ]
})
export class AppModule { }
