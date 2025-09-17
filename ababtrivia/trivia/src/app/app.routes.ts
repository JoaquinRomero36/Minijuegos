import { Routes } from '@angular/router';
import { TriviaComponent } from './trivia/trivia.component';

export const routes: Routes = [
    {path: "", redirectTo: "trivia", pathMatch: 'full'},
    { path : "trivia", component: TriviaComponent},
];
