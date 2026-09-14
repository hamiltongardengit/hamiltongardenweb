import { Component, OnInit } from '@angular/core';
import { API } from '../../../services/api-enum/api.enum';
import { Router } from '@angular/router';
import { CommonService } from '../../../services/common.service';

@Component({
  selector: 'app-destination-list',
  templateUrl: './destination-list.component.html',
  styleUrls: ['./destination-list.component.css']
})
export class DestinationListComponent implements OnInit {
  search = '';
  items = [];
  params = {
    current_page: 1,
    pagesize: 9,
    keyword: '',
    category: 'Domestic',
    location: '',
  };
  timer: any;
  loading: boolean = true;
  totalPages: number = 0;
  locations: any;

  constructor(private commonService: CommonService, private router: Router) { }

  ngOnInit() {
    this.getAllDestinations();
  }

  getAllDestinations(page?) {
    this.loading = true;
    this.commonService.postRequest(this.params, API.destinations).subscribe((res: any) => {
      if (res) {
        this.items = res?.destinations;
        this.locations = res?.locations;
        // this.total_rows = res?.pagination?.total;
        this.totalPages = res?.pagination?.total_pages;
        this.loading = false;
      }
    })
  }

  filterDestinations() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.getAllDestinations();
    }, 300);
  }

  changeServer(current_page?, change_type?) {
    if (change_type == 'category') this.params.location = "";
    this.params.current_page = current_page || 1;
    window.scrollTo(0, 200);
    // this.params.pagesize = data.pagesize || 18;
    // this.params.keyword = data.search || '';

    if (change_type === 'search') {
      this.filterDestinations();
    } else {
      this.getAllDestinations();
    }
  }

  viewDestination(destination: any = null) {
    if (destination) {
      sessionStorage.setItem('destinationData', JSON.stringify(destination));
    } else {
      sessionStorage.removeItem('destinationData');
    }
    this.router.navigate(['/destinations/detail']);
  }

}
