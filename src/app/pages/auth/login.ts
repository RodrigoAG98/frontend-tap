import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RippleModule, AppFloatingConfigurator],
    templateUrl: './login.component.html'
})

export class Login {
    user: string = '';

    password: string = '';

    checked: boolean = false;

    private authService = inject(AuthService);
    private router = inject(Router);

    onLogin() {
        this.authService.login({ user: this.user, password: this.password }).subscribe({
        next: (res: any) => {
            this.authService.setToken(res.access_token);
            this.authService.setPermissions(res.permissions);
            this.router.navigate(['/']);
        },
        error: () => alert('Credenciales incorrectas')
        });
    }
}
