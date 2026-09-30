import { Component, EventEmitter, Input, inject, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { ProductService } from '../Services/product.service';
import { Product } from '../../../models/product.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'new-product',
  imports: [ButtonModule, CommonModule, DialogModule, FormsModule, InputNumberModule, InputTextModule, MultiSelectModule],
  templateUrl: './new-product.component.html'
})
export class NewProductComponent {
@Input({required: true}) productDialog!: boolean;
@Input({required: true}) product!: Product;
@Output() closeDialog = new EventEmitter<void>();
@Output() showToast = new EventEmitter();
private productService = inject(ProductService);
processing: boolean = false;

errors = signal<Record<string, string>>({});

hideDialog() {
  this.closeDialog.emit();
}

//Guardar o actualizar según sea el caso
    saveProfile() {
        this.errors.set({});
        this.processing = true;
        const userId = this.product.id;
        //Sino existe un id creamos nuevo usuario
        if (!userId){
            const newProduct: Product = {
                product_code: this.product.product_code,
                name: this.product.name,
                brand: this.product.brand,
                price: this.product.price,
            };
            this.productService.createProduct(newProduct).subscribe({
                next: (res:string) => {
                    this.processing = false;
                    this.closeDialog.emit();
                    this.showToast.emit({type: 'success', msg: res});
                },
                error: (err) => {
                    this.setErrors(err);
                    this.processing = false;
                }
            });
        }else{
            //De otro modo actualizamos el existente
            const updatedProduct: Product = {
                id: this.product.id,
                product_code: this.product.product_code,
                name: this.product.name,
                brand: this.product.brand,
                price: this.product.price,
            };
            this.productService.updateProduct(userId, updatedProduct).subscribe({
                next: (res:string) => {
                    this.processing = false;
                    this.closeDialog.emit();
                    this.showToast.emit({type: 'success', msg: res});
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
            this.showToast.emit({type: 'warn', msg: 'Por favor revisa el formulario.'});
        }
    }

}
