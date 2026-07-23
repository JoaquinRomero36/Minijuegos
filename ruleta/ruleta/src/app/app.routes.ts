import { Routes } from '@angular/router';
import { RuletaComponent } from './ruleta/ruleta.component';
import { AppComponent } from './app.component';

export const routes: Routes = [
    {path: "", redirectTo: "landing", pathMatch: 'full'},
    { path : "ruleta", component: RuletaComponent},
];
