import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sub-gallery',
  templateUrl: './sub-gallery.component.html',
  styleUrls: ['./sub-gallery.component.css']
})
export class SubGalleryComponent implements OnInit {
  images: any[] = [
    { thumb: 'assets/clientTemplate/img/gallery/gallery2.webp', src: 'assets/clientTemplate/img/gallery/gallery2.webp', alt: 'Image 2' },
    { thumb: 'assets/clientTemplate/img/gallery/gallery5.webp', src: 'assets/clientTemplate/img/gallery/gallery5.webp', alt: 'Image 5' },
    { thumb: 'assets/clientTemplate/img/gallery/gallery8.webp', src: 'assets/clientTemplate/img/gallery/gallery8.webp', alt: 'Image 8' },
    { thumb: 'assets/clientTemplate/img/gallery/gallery9.webp', src: 'assets/clientTemplate/img/gallery/gallery9.webp', alt: 'Image 9' },
    { thumb: 'assets/clientTemplate/img/gallery/gallery10.webp', src: 'assets/clientTemplate/img/gallery/gallery10.webp', alt: 'Image 10' },
    { thumb: 'assets/clientTemplate/img/gallery/gallery13.webp', src: 'assets/clientTemplate/img/gallery/gallery14.webp', alt: 'Image 13' },
  ];

  constructor() { }

  ngOnInit() {
  }

}
