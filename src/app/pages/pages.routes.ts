import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Users } from './users/users.component';
import { Products } from './products/products.component';
import { Profiles } from './profiles/profiles.component';

export default [
    { path: 'documentation', component: Documentation },
    { path: 'users', component: Users },
    { path: 'products', component: Products },
    { path: 'profiles', component: Profiles },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
