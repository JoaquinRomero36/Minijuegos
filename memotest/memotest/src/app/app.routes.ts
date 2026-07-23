import { Routes } from '@angular/router';
import { MemotestComponent } from './memotest/memotest.component';

export const routes: Routes = [
    {path: "", redirectTo: "memotest", pathMatch: 'full'},
    { path : "memotest", component: MemotestComponent},
];
