import { Routes } from '@angular/router';
import { ReactionComponent } from './reaction/reaction.component';

export const routes: Routes = [
    {path: "", redirectTo: "reaction", pathMatch: 'full'},
    { path : "reaction", component: ReactionComponent},
];
