import {Subject} from 'rxjs/Subject';

import { Exercise } from './exercise.model';
import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { UIService } from '../shared/ui.service';
import * as UI from '../shared/ui.actions';
import * as Training from './training.actions';
import * as fromTraining from './training.reducer';
import { Store } from '@ngrx/store';
@Injectable()
export class TrainingService {
    exerciseChanged = new Subject<Exercise>();
    exercisesChanged = new Subject<Exercise[]>();
    finishedExercisesChanged = new Subject<Exercise[]>();

    private subs: Subscription[] = [];
    private availableExercises: Exercise[] = [];

    private runningExercise: Exercise;
    private exercises: Exercise[] = [];
    constructor(private db: AngularFirestore, private uiService: UIService, private store: Store<fromTraining.State>) {}

    fetchAvailableExercises() {
        this.store.dispatch(new UI.StartLoading());
        this.subs.push(
            this.db.collection('availableExercises').
                snapshotChanges()
                .pipe(map(docArray => {
                return docArray.map(doc => {
                    const exercise = doc.payload.doc.data() as Exercise;
                    exercise.id = doc.payload.doc.id;
                    return exercise;
                    });
                }))
                .subscribe(exercises => {
                    this.store.dispatch(new UI.StopLoading());
                    this.store.dispatch(new Training.SetAvailableTrenings(exercises));
                }, error => {
                    this.store.dispatch(new UI.StopLoading());
                    this.uiService.showSnackbar('Fetching exercises failed, please try again later', null, 3000);
                    this.exercisesChanged.next(null);
                })
        );
    }

    startExercise(selectedId: string) {
        this.store.dispatch(new Training.StartTraining(selectedId));
    }

    completeExercise() {
        this.addDataToDatabase({
            ...this.runningExercise,
            state: 'completed',
            date: new Date()
        });
        this.store.dispatch(new Training.StopTraining());
    }

    cancelExercise(progress: number) {
        this.addDataToDatabase({
            ...this.runningExercise,
            duration: this.runningExercise.duration * (progress / 100),
            calories: this.runningExercise.calories * (progress / 100),
            state: 'cancelled',
            date: new Date()
        });
        this.store.dispatch(new Training.StopTraining());
    }

    getRunningExercise() {
        return {...this.runningExercise};
    }

    fetchCompletedOrCancelledExercises() {
        this.subs.push(
            this.db
            .collection('finishedExercises')
            .valueChanges()
            .subscribe((exercises: Exercise[]) => {
                this.store.dispatch(new Training.SetFinishedTrainings(exercises));
            }));
    }
    cancelSubscriptions() {
        this.subs.forEach( sub => sub.unsubscribe());
    }
    private addDataToDatabase(exercise: Exercise) {
        this.db.collection('finishedExercises').add(exercise);
    }
}
