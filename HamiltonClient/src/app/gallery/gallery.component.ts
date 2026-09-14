import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {
  images: any[] = [
    { thumb: 'assets/clientTemplate/img/gallery/gallery3.webp', src: 'assets/clientTemplate/img/gallery/gallery3.webp', alt: 'Image 3' },
    { thumb: 'assets/clientTemplate/img/gallery/gallery1.webp', src: 'assets/clientTemplate/img/gallery/gallery1.webp', alt: 'Image 1' },
    { thumb: 'assets/clientTemplate/img/gallery/gallery4.webp', src: 'assets/clientTemplate/img/gallery/gallery4.webp', alt: 'Image 4' },
    { thumb: 'assets/clientTemplate/img/gallery/gallery2.webp', src: 'assets/clientTemplate/img/gallery/gallery2.webp', alt: 'Image 2' },
    { thumb: 'assets/clientTemplate/img/gallery/gallery5.webp', src: 'assets/clientTemplate/img/gallery/gallery5.webp', alt: 'Image 5' },
    { thumb: 'assets/clientTemplate/img/gallery/gallery8.webp', src: 'assets/clientTemplate/img/gallery/gallery8.webp', alt: 'Image 8' },
    { thumb: 'assets/clientTemplate/img/gallery/gallery6.webp', src: 'assets/clientTemplate/img/gallery/gallery6.webp', alt: 'Image 6' },
    { thumb: 'assets/clientTemplate/img/gallery/gallery11.webp', src: 'assets/clientTemplate/img/gallery/gallery11.webp', alt: 'Image 11' },
    { thumb: 'assets/clientTemplate/img/gallery/gallery7.webp', src: 'assets/clientTemplate/img/gallery/gallery7.webp', alt: 'Image 7' },
    { thumb: 'assets/clientTemplate/img/gallery/gallery9.webp', src: 'assets/clientTemplate/img/gallery/gallery9.webp', alt: 'Image 9' },
    { thumb: 'assets/clientTemplate/img/gallery/gallery10.webp', src: 'assets/clientTemplate/img/gallery/gallery10.webp', alt: 'Image 10' },
    { thumb: 'assets/clientTemplate/img/gallery/gallery12.webp', src: 'assets/clientTemplate/img/gallery/gallery12.webp', alt: 'Image 12' },
    { thumb: 'assets/clientTemplate/img/gallery/gallery13.webp', src: 'assets/clientTemplate/img/gallery/gallery13.webp', alt: 'Image 13' },
    { thumb: 'assets/clientTemplate/img/gallery/gallery14.webp', src: 'assets/clientTemplate/img/gallery/gallery14.webp', alt: 'Image 14' },
    { thumb: 'assets/clientTemplate/img/gallery/gallery15.webp', src: 'assets/clientTemplate/img/gallery/gallery15.webp', alt: 'Image 15' },
  ];

  constructor() { }

  ngOnInit() {
  }

}
