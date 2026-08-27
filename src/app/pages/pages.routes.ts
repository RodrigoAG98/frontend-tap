import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Users } from './users/users.component';
import { Products } from './products/products.component';
import { Profiles } from './profiles/profiles.component';
import { permissionGuard } from '../../app/core/guards/permission.guard';

export default [
    { path: 'documentation', component: Documentation },
    { path: 'users', canActivate: [permissionGuard], component: Users , data: { permission: 'users:read' }},
    { path: 'products', canActivate: [permissionGuard], component: Products , data: { permission: 'products:read' }},
    { path: 'profiles', canActivate: [permissionGuard], component: Profiles , data: { permission: 'profiles:read' }},
    { path: '**', redirectTo: '/notfound' }
] as Routes;
