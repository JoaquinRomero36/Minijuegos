import { Routes } from '@angular/router';
import { JackpotComponent } from './jackpot/jackpot.component';

export const routes: Routes = [
    {path: "", redirectTo: "jackpot", pathMatch: 'full'},
    { path : "jackpot", component: JackpotComponent},
];
