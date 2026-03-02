import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css'
})
export class UploadComponent {

  loanId!: number;
  selectedFile!: File;

  constructor(private http: HttpClient,
              private route: ActivatedRoute) {

    this.route.queryParams.subscribe(params => {
      this.loanId = +params['loanId'];
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  upload() {

    if (!this.selectedFile) {
      alert("Select a file first");
      return;
    }

    this.http.get(
      `http://98.88.109.141:8080/api/documents/upload-url/${this.loanId}?fileName=${this.selectedFile.name}`,
      { responseType: 'text' }
    ).subscribe(presignedUrl => {

      fetch(presignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': this.selectedFile.type
        },
        body: this.selectedFile
      }).then(() => {
        alert("Upload successful!");
      }).catch(() => {
        alert("Upload failed!");
      });

    });
  }
}