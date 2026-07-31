import { Routes } from '@angular/router';
import { EmbajadorComponent } from './embajador/embajador.component';

export const routes: Routes = [
    {path: "", redirectTo: "embajador", pathMatch: 'full'},
    { path : "embajador", component: EmbajadorComponent},
];
