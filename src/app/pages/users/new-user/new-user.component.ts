import { Component, signal, inject, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../../models/user.model';
import { Profile } from '../../../models/profile.model';
import { UserService } from '../Services/user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'new-user',
  imports: [CommonModule, ButtonModule, DialogModule, FormsModule, InputTextModule, MultiSelectModule],
  templateUrl: './new-user.component.html',
})
export class NewUserComponent {
  @Input({required: true}) userDialog!: boolean;
  @Input({required: true}) user!: User;
  @Input({required: true}) profiles!: Profile[];
  @Output() closeDialog = new EventEmitter<void>();
  @Output() showToastMessage = new EventEmitter();
  private userService = inject(UserService);
  processing: boolean = false;

  errors = signal<Record<string, string>>({});

  // Signal para guardar el archivo físico
  selectedFile = signal<File | null>(null);

  // Signal para la vista previa en base64
  imagePreview = signal<string | null>(null);

  //Similar a watch de Vue pero solo para inputs
  ngOnChanges(changes: SimpleChanges){
    if(changes['userDialog']){
      this.getAvatar();
    }
  }

  //Obtener avatar del usuario
  getAvatar() {
        const userId = this.user.id
        if(userId){
            this.userService.avatarUser(userId).subscribe({
                next: (data) => {
                    //Asignamos valores
                    this.imagePreview.set(data);
                },
                error: (err) => console.error('Error obteniendo el avatar:', err)
            });
        }
    }

  //Guardar o actualizar según sea el caso
    saveUser() {
        this.errors.set({});
        this.processing = true;
        const userId = this.user.id;
        //Sino existe un id creamos nuevo usuario
        if (!userId){
            const newUser: User = {
                user: this.user.user,
                name: this.user.name,
                telephone: this.user.telephone,
                profiles: this.user.profiles,
            };
            const file = this.selectedFile();
            this.userService.createUser(newUser,file).subscribe({
                next: (res:string) => {
                    this.processing = false;
                    //this.loadUsers(); cambiar a emit
                    this.hideDialog();
                    this.showToastMessage.emit({type:'success', message: res})
                },
                error: (err) => {
                    this.setErrors(err);
                    this.processing = false;
                }
            });
        }else{
            //De otro modo actualizamos el existente
            const updatedUser: User = {
                id: this.user.id,
                user: this.user.user,
                name: this.user.name,
                telephone: this.user.telephone,
                profiles: this.user.profiles,
            };
            const file = this.selectedFile();
            this.userService.updateUser(userId, updatedUser,file).subscribe({
                next: (res:string) => {
                    this.processing = false;
                    //this.loadUsers();
                    this.hideDialog();
                    this.showToastMessage.emit({type:'success', message: res})
                },
                error: (err) => {
                    this.setErrors(err);
                    this.processing = false;
                }
            });
        }
    }

    //Manejo de errores
    setErrors(err: HttpErrorResponse) {
        // Capturamos el error 422 de Laravel
        if (err.status === 422 && err.error?.errors) {
            const rawErrors = err.error.errors;
            const formattedErrors: Record<string, string> = {};

            // Extraemos solo el primer mensaje de error de cada campo
            Object.keys(rawErrors).forEach((key) => {
                formattedErrors[key] = rawErrors[key][0];
            });

            // Actualizamos la Signal con los errores procesados
            this.errors.set(formattedErrors);
            this.showToastMessage.emit({type:'warn', message: 'Por favor revisa el formulario.'})
        }
    }

    //Cerramos dialogo y limpiamos errores
    hideDialog() {
        this.closeDialog.emit()
        this.selectedFile.set(null);
        this.imagePreview.set(null);
        this.errors.set({});
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
        const file = input.files[0];
        this.selectedFile.set(file);

        // Generar vista previa dinámica
        const reader = new FileReader();
        reader.onload = () => this.imagePreview.set(reader.result as string);
        reader.readAsDataURL(file);
        }
    }
}
