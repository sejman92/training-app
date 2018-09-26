import { Component, OnInit, OnDestroy  } from '@angular/core';
import { TrainingService } from '../training.service';
import { Exercise } from '../exercise.model';
import { NgForm } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { UIService } from '../../shared/ui.service';
import * as fromRoot from '../../app.reducer';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-new-training',
  templateUrl: './new-training.component.html',
  styleUrls: ['./new-training.component.scss']
})
export class NewTrainingComponent implements OnInit, OnDestroy {

  exercises: Exercise[];
  private exerciseSubscription: Subscription;
  isLoading$: Observable<boolean>;

  constructor(private trainingService: TrainingService, private uiService: UIService, private store: Store<fromRoot.State>) {}

  ngOnInit() {
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);

    this.exerciseSubscription = this.trainingService.exercisesChanged.subscribe( exercises => {
      this.exercises = exercises;
    });
    this.fetchExercises();
  }
  fetchExercises() {
    this.trainingService.fetchAvailableExercises();
  }
  ngOnDestroy() {
    if (this.exerciseSubscription) {
      this.exerciseSubscription.unsubscribe();
    }
  }
  onStartTraining(form: NgForm) {
    this.trainingService.startExercise(form.value.exercise);
  }


}
