import { Component, OnInit, signal, inject } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProductService } from './Services/product.service';
import { AuthService } from '../../core/services/auth.service';
import { Product } from '../../models/product.model';
import { HttpErrorResponse } from '@angular/common/http';
import { NewProductComponent } from './new-product/new-product.component';

interface Column {
    field: string;
    header: string;
    customExportHeader?: string;
}

@Component({
    selector: 'app-crud',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        FormsModule,
        ButtonModule,
        ToastModule,
        ToolbarModule,
        InputTextModule,
        MultiSelectModule,
        InputNumberModule,
        TagModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule,
        NewProductComponent
    ],
    templateUrl: 'products.component.html',
    providers: [MessageService, ProductService, ConfirmationService]
})
export class Products implements OnInit {
    private authService = inject(AuthService);
    productDialog: boolean = false;
    loadingProducts: boolean = false;
    loadingPdf: boolean = false;
    loadingXlsx: boolean = false;
    processing: boolean = false;
    search: string = '';

    products = signal<Product[]>([]);
    //Equivalente a Objeto o Form en Vue
    product = signal<Product>({
        product_code: '',
        name: '',
        brand: '',
        price: 0,
    });

    errors = signal<Record<string, string>>({});

    //Columnas para PrimeNg
    cols: Column[] = [
            { field: 'code', header: 'Code', customExportHeader: 'Product Code' },
            { field: 'name', header: 'Name' },
        ];

    constructor(
        private productService: ProductService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadProducts();
    }

    //Carga de usuarios
    loadProducts(search?: string) {
        this.loadingProducts = true;
        //Realizamos petición
        this.productService.getProducts(search).subscribe({
            next: (data) => {
                //Asignamos valores
                this.products.set(data);
                this.processing = false;
                this.loadingProducts = false;
            },
            error: (err) => console.error('Error cargando productos:', err)
        });
    }

    //Filtro local en front
    onGlobalFilter() {
        this.loadProducts(this.search);
    }

    can(permission: string): boolean {
        return this.authService.hasPermission(permission);
    }

    //Resetear objecto signal de user y abrimos dialogo
    openNew() {
        this.product.set({
            product_code: '',
            name: '',
            brand: '',
            price: 0,
        });
        this.productDialog = true;
    }

    //Establecemos valores para User y abrimos dialogo
    editProduct(product: Product) {
        this.product.set({ ...product });
        this.productDialog = true;
    }

    //Cerramos dialogo y limpiamos errores
    hideDialog() {
        this.loadProducts();
        this.productDialog = false;
        this.errors.set({});
    }

    //Eliminación de usuario
    deleteProduct(profile: Product) {
        const userId = profile.id;
        if (!userId) return;
        this.confirmationService.confirm({
            message: 'Estás seguro que quieres eliminar a ' + profile.name + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => {
                this.productService.deleteProduct(userId).subscribe({
                    next: (res:string) => {
                        this.loadProducts();
                        this.showToast({type:'success', msg: res});
                    },
                    error: (err) => console.error('Error eliminando el producto:', err)
                });
            }
        });
    }

    // Función genérica para descargar archivos Blob
    private downloadFile(blob: Blob, fileName: string): void {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    //Exportar a pdf
    exportPdf() {
        this.loadingPdf = true;
        this.productService.exportPdf(this.search).subscribe({
            next: (blob: Blob) => {
                this.downloadFile(blob, `reporte_productos_${new Date().getTime()}.pdf`);
                this.loadingPdf=false;
            },
            error: (err: HttpErrorResponse) => {
                console.error('Error al exportar Excel:', err);
                this.loadingPdf = false;
            }
        });
    }

    //Exportar a Xlsx
    exportXlsx() {
        this.loadingXlsx = true;
            this.productService.exportExcel(this.search).subscribe({
            next: (blob: Blob) => {
                this.downloadFile(blob, `productos_${new Date().getTime()}.xlsx`);
                this.loadingXlsx=false;
            },
            error: (err: HttpErrorResponse) => {
                console.error('Error al exportar Excel:', err);
                this.loadingXlsx = false;
            }
        });
    }

    //Agregar un nuevo mensaje a la pantala(toast)
    showToast(data: { type: string, msg: string}){
        this.messageService.add({
            severity: data.type,
            summary: data.msg,
            life: 3000
        });
    }
}