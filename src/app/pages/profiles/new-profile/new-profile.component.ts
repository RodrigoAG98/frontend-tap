import { Component, Input, Output, signal, inject, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProfileService } from '../Services/profile.service';
import { Profile } from '../../../models/profile.model';
import { Permission } from '../../../models/permission.model';

@Component({
  selector: 'new-profile',
  imports: [ButtonModule, CommonModule, DialogModule, FormsModule, InputTextModule, MultiSelectModule],
  templateUrl: './new-profile.component.html',
})
export class NewProfileComponent {
@Input({required: true}) profile!: Profile;
@Input({required: true}) showDialog!: boolean;
@Input({required: true}) permissions!: Permission[];
@Output() showToast = new EventEmitter();
@Output() closeDialog = new EventEmitter<void>();
@Output() reloadData = new EventEmitter<void>();

private profileService = inject(ProfileService);

processing: boolean = false;
errors = signal<Record<string, string>>({});

//Guardar o actualizar según sea el caso
  saveProfile() {
      this.errors.set({});
      this.processing = true;
      const userId = this.profile.id;
      //Sino existe un id creamos nuevo usuario
      if (!userId){
          const newProfile: Profile = {
              profile_code: this.profile.profile_code,
              name: this.profile.name,
              sections: this.profile.sections
          };
          this.profileService.createProfile(newProfile).subscribe({
              next: (res:string) => {
                  this.processing = false;
                  this.reloadData.emit();
                  this.hideDialog();
                  this.showToast.emit({type: 'success', msg: res});
              },
              error: (err) => {
                  this.setErrors(err);
                  this.processing = false;
              }
          });
      }else{
          //De otro modo actualizamos el existente
          const updatedProfile: Profile = {
              id: this.profile.id,
              profile_code: this.profile.profile_code,
              name: this.profile.name,
              sections: this.profile.sections
            };
          this.profileService.updateProfile(userId, updatedProfile).subscribe({
              next: (res:string) => {
                  this.processing = false;
                  this.reloadData.emit();
                  this.hideDialog();
                  this.showToast.emit({type: 'success', msg: res});
              },
              error: (err) => {
                  this.setErrors(err);
                  this.processing = false;
              }
          });
      }
  }

//Cerramos dialogo y limpiamos errores
hideDialog() {
  this.errors.set({});
  this.closeDialog.emit()
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
          this.showToast.emit({type: 'warn', msg:'Por favor revisa el formulario.'});
      }
  }
}
