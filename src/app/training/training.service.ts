import {Subject} from 'rxjs/Subject';

import { Exercise } from './exercise.model';
import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { UIService } from '../shared/ui.service';
import * as UI from '../shared/ui.actions';
import * as fromRoot from '../app.reducer';
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
    constructor(private db: AngularFirestore, private uiService: UIService, private store: Store<fromRoot.State>) {}

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
                    this.availableExercises = exercises;
                    this.exercisesChanged.next([...this.availableExercises]);
                }, error => {
                    this.store.dispatch(new UI.StopLoading());
                    this.uiService.showSnackbar('Fetching exercises failed, please try again later', null, 3000);
                    this.exercisesChanged.next(null);
                })
        );
    }

    startExercise(selectedId: string) {
        // this.db.doc('availableExercises/' + selectedId).update({lastSelected: new Date()});
        this.runningExercise = this.availableExercises.find(ex => ex.id === selectedId);
        this.exerciseChanged.next({
            ...this.runningExercise
        });
    }

    completeExercise() {
        this.addDataToDatabase({
            ...this.runningExercise,
            state: 'completed',
            date: new Date()
        });
        this.runningExercise = null;
        this.exerciseChanged.next(null);
    }

    cancelExercise(progress: number) {
        this.addDataToDatabase({
            ...this.runningExercise,
            duration: this.runningExercise.duration * (progress / 100),
            calories: this.runningExercise.calories * (progress / 100),
            state: 'cancelled',
            date: new Date()
        });
        this.runningExercise = null;
        this.exerciseChanged.next(null);
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
                this.finishedExercisesChanged.next(exercises);
            }));
    }
    cancelSubscriptions() {
        this.subs.forEach( sub => sub.unsubscribe());
    }
    private addDataToDatabase(exercise: Exercise) {
        this.db.collection('finishedExercises').add(exercise);
    }
}
