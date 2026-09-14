import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-testimonials',
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.css']
})
export class TestimonialsComponent implements OnInit {
  testimonials = [
    { name: "Aarav Singh", review: "An amazing travel experience! Every detail was meticulously planned, and I enjoyed every moment.", rating: 5 },
    { name: "Diya Sharma", review: "The best agency I’ve traveled with! Friendly guides and excellent service throughout.", rating: 5 },
    { name: "Kavya Patel", review: "Enjoyed seamless experience. The team went above and beyond to ensure everything was perfect.", rating: 5 },
    { name: "Rohan Mehta", review: "The local guides were exceptional, providing insights that made the trip unforgettable.", rating: 5 },
    { name: "Priya Desai", review: "I had an incredible time. Hamilton Garden Inn & Suites made every aspect of my trip easy and enjoyable.", rating: 5 },
    { name: "Rajesh Gupta", review: "Professional and efficient service, with a personal touch that made the trip special.", rating: 5 },
    { name: "Sneha Kapoor", review: "Fantastic service and attention to detail! The team truly knows how to craft amazing travel experiences.", rating: 5 },
    { name: "Ananya Nair", review: "From start to finish, this was the best travel experience I’ve had. Highly recommended!", rating: 5 },
    { name: "Vikram Rao", review: "The entire trip was well-organized, and the guides were knowledgeable and friendly.", rating: 5 },
    { name: "Nisha Verma", review: "Every detail was perfect. The team at Hamilton Garden Inn & Suites truly made my trip unforgettable.", rating: 5 },
    { name: "Ishaan Khanna", review: "The trip exceeded all my expectations! I will be recommending this agency to everyone I know.", rating: 5 },
    { name: "Aman Kapoor", review: "This travel agency knows how to make every moment special. The experience was flawless!", rating: 5 },
    { name: "Tara Bhat", review: "Incredible experience! The guides were knowledgeable and friendly, and every part of the trip was well-executed.", rating: 5 },
    { name: "Devika Sinha", review: "I was impressed with the personalized service and the attention to detail. A fantastic trip!", rating: 5 },
    { name: "Arjun Patel", review: "The best travel experience I’ve had! Everything was planned perfectly, and I had a wonderful time.", rating: 5 },
    { name: "Ritika Chatterjee", review: "An unforgettable journey! The team at Hamilton Garden Inn & Suites ensured that every detail was perfect.", rating: 5 },
    { name: "Kunal Malhotra", review: "The trip was seamless and enjoyable. Great service and great experiences, I really enjoy it!", rating: 5 },
    { name: "Radhika Jain", review: "I was blown away by the level of service and care provided. Truly a remarkable trip!", rating: 5 },
    { name: "Kabir Agarwal", review: "From the start, the team made me feel comfortable and provided top-notch service. Highly recommend!", rating: 5 },
    { name: "Isha Reddy", review: "I couldn’t have asked for a better experience. Every detail was handled with care and precision.", rating: 5 },
    { name: "Raghav Prasad", review: "Exceptional service and unforgettable memories. I’ll definitely be booking again.", rating: 5 },
    { name: "Simran Kaur", review: "A wonderful experience from start to finish! Highly recommend to anyone looking for an amazing trip.", rating: 5 },
    { name: "Krishna Iyer", review: "Amazing attention to detail and great planning. I’ll definitely travel with them again.", rating: 5 },
    { name: "Reema Nambiar", review: "A well-executed and enjoyable trip. Every moment was filled with excitement and joy!", rating: 5 },
    { name: "Akash Pillai", review: "Absolutely wonderful service. The trip was smooth and everything was organized perfectly.", rating: 5 },
    { name: "Shivani Deshmukh", review: "The best travel agency I’ve ever used! Great guides, great service, great memories.", rating: 5 },
    { name: "Rohit Menon", review: "Perfect trip! Everything was handled with professionalism and care. Highly recommend.", rating: 5 },
    { name: "Siddharth Nair", review: "A memorable trip. The guides were knowledgeable, and the whole experience was unforgettable.", rating: 5 },
    { name: "Pooja Saxena", review: "Truly the best experience I’ve had with any travel agency. Excellent service all around.", rating: 5 },
    { name: "Harsh Vardhan", review: "Great service and an unforgettable journey. I’ll definitely travel with them again!", rating: 5 }
  ];

  constructor() { }

  ngOnInit() {
  }

  generateStars(rating: number): Array<number> {
    return Array(rating).fill(0);
  }

}
