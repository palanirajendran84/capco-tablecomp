import { Component, OnInit, AfterViewChecked,Input, Output,Renderer, ViewChild, AfterContentChecked, AfterViewInit, ElementRef } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import {RequestOptions, Request, RequestMethod} from '@angular/http';


import { HttpErrorResponse } from '@angular/common/http';
import { AngularWaitBarrier } from 'blocking-proxy/built/lib/angular_wait_barrier';
import { FormGroup, FormControl } from '@angular/forms';





@Component({
  selector: 'tc-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
//  
export class TableComponent implements OnInit, AfterViewInit, AfterContentChecked { 
  @ViewChild('tblbodyData') nameInput:ElementRef;
  
  Element: any;
  public firstText: string = "«";
  public lastText: string = "»";
  public previousText: string = "‹";
  public nextText: string = "›";
  public pgsize:number=2;
  public displaypageFooter:boolean = true;
  public strpgsize:string;
  public pgstart:number =1;
  public pgend:number=10;
  public boundaryLinks:boolean = true;
  public directionLinks:boolean = true;
  public totalrecords:number=0;
  public totalPages:number=0;
  public pages:Array<any>;;
  public rotate:boolean = false;
  public adjacents:number = 2;
  public pageNumber:number = 1;
  public maxPageOptionsDisplay: number = 27;
  public formdata;
  constructor(private httpService: HttpClient, private renderer: Renderer) {
    this.pgstart=0;
    this.pgend=2;
    this.pgsize=2;
    this.strpgsize="2"
    

   }
  arrEmployeesObject: object [];
  arrEmployees: string [];
  arrProperties:string []=new Array();
  strFirstRow:string='';
  
  ngAfterViewInit() {
    

  }
  ngAfterContentChecked() {
    //alert(this.nameInput.nativeElement.rows.length);
    //alert(this.renderer.invokeElementMethod(this.nameInput.nativeElement,'length'));
    //alert(document.getElementById('tblbodyData').getElementsByTagName('tbody')[0].getElementsByTagName('tr').length);
}

Goto(val): void
{
  this.pageNumber=val;
  console.log(val)
  this.calculateTotalPages();
  this.pages = this.getPages(this.pageNumber, this.totalPages);
  this.pgstart=((val-1)*this.pgsize);
  this.pgend=this.pgstart+this.pgsize;
};

calculateTotalPages() :void{
  var totalPages = this.pgsize < 1 ? 1 : Math.ceil(this.totalrecords / this.pgsize);
  this.totalPages = Math.max(totalPages || 0, 1);
  this.displaypageFooter=this.totalPages <= 1 ? false : true;
  this.strFirstRow="";
  console.log("initial total pages - "+this.totalPages);
}

Reload(keycod): void
{
       if(keycod==13)
        {
          if( this.strpgsize!="0")
          {
            this.pgsize=parseInt(this.strpgsize);
            this.pageNumber=1;
            this.calculateTotalPages();
            this.pages = this.getPages(this.pageNumber, this.totalPages);
            this.pgstart=0;
            this.pgend=this.pgsize;
          }
        }
        else if(!(keycod >= 48 && keycod <= 57) || this.strpgsize=="0")
        {
          this.strpgsize=this.pgsize.toString();
        }
     
  }

  makePage(number: number, text:string, isActive:boolean) : any {
    return {
      number: number,
      text: text,
      active: isActive
    };
  };

  noPreviousBtn() : boolean {
    return this.pageNumber === 1;
  }
  
  noNextBtn() : boolean {
    return this.pageNumber === this.totalPages;
  }

  getPgText(key:string) : string {
    return this[key + 'Text'] || this[key + 'Text'];
  }
  // method to get pages array
  getPages(currentPage, totalPages) {
    var pages = [];

    // Default page limits
    var startPage: number = 1, endPage: number = totalPages;
    var isMaxPageArraySized: boolean = this.maxPageOptionsDisplay < totalPages;

    var calcMaxPageArraySized:number = isMaxPageArraySized ? this.maxPageOptionsDisplay : 0;

    // If we want to limit the maxSize within the constraint of the adjacents, we can do so like this.
    // This adjusts the maxSize based on current page and current page and whether the front-end adjacents are added.
    if (isMaxPageArraySized && !this.rotate && this.adjacents > 0 && currentPage >= (calcMaxPageArraySized - 1) && totalPages >= (calcMaxPageArraySized + (this.adjacents * 2))) {
      calcMaxPageArraySized = this.maxPageOptionsDisplay - this.adjacents;
    }

    // Adjust max size if we are going to add the adjacents
    if (isMaxPageArraySized && !this.rotate && this.adjacents > 0) {
      var tempStartPage = ((Math.ceil(currentPage / calcMaxPageArraySized) - 1) * calcMaxPageArraySized) + 1;
      var tempEndPage = Math.min(tempStartPage + calcMaxPageArraySized - 1, totalPages);

      if (tempEndPage < totalPages) {
        if (totalPages - this.adjacents > currentPage) { // && currentPage > adjacents) {
          calcMaxPageArraySized = calcMaxPageArraySized - this.adjacents;
        }
      }
    }

    // recompute if maxPageSize
    if (isMaxPageArraySized) {
      if (this.rotate) {
        // Current page is displayed in the middle of the visible ones
        startPage = Math.max(currentPage - Math.floor(calcMaxPageArraySized / 2), 1);
        endPage = startPage + calcMaxPageArraySized - 1;

        // Adjust if limit is exceeded
        if (endPage > totalPages) {
          endPage = totalPages;
          startPage = endPage - calcMaxPageArraySized + 1;
        }
      } else {
        // Visible pages are paginated with maxSize
        startPage = ((Math.ceil(currentPage / calcMaxPageArraySized) - 1) * calcMaxPageArraySized) + 1;

        // Adjust last page if limit is exceeded
        endPage = Math.min(startPage + calcMaxPageArraySized - 1, totalPages);
      }
    }

    // Add page number links
    for (var num = startPage; num <= endPage; num++) {
        var page = this.makePage(num, num.toString(), num === currentPage);
        pages.push(page);
    }

    // Add links to move between page sets
    if (isMaxPageArraySized && !this.rotate) {
      if (startPage > 1) {
        var previousPageSet = this.makePage(startPage - 1, '...', false);
        pages.unshift(previousPageSet);
        if (this.adjacents > 0) {
          if (totalPages >= this.maxPageOptionsDisplay + (this.adjacents * 2)) {
            pages.unshift(this.makePage(2, '2', false));
            pages.unshift(this.makePage(1, '1', false));
          }
        }
      }

      if (endPage < totalPages) {
        var nextPageSet = this.makePage(endPage + 1, '...', false);
        var addedNextPageSet = false;
        if (this.adjacents > 0) {
          if (totalPages - this.adjacents > currentPage) { // && currentPage > adjacents) {
            var removedLast = false;
            addedNextPageSet = true;
            if (pages && pages.length > 1 && pages[pages.length - 1].number == totalPages - 1) {
              pages.splice(pages.length - 1, 1);
              removedLast = true;
            }
            pages.push(nextPageSet);
            if (removedLast || pages[pages.length - 1].number < totalPages - 2 || pages[pages.length - 2].number < totalPages - 2) {
              pages.push(this.makePage(totalPages - 1, (totalPages - 1).toString(), false));
            }

            pages.push(this.makePage(totalPages, (totalPages).toString(), false));
          }
        }

        if (!addedNextPageSet) {
          pages.push(nextPageSet);
        }
      }
    }
console.log("initial - "+pages.length);
    return pages;
  }

  onClickSubmit(id,status) {
    let headers = new HttpHeaders({['Content-Type']: 'application/json'});
//headers.append('Content-Type', 'application/x-www-form-urlencoded');

//let options = new RequestOptions({ headers: headers });

var body = "id=" + id + "&status=" + status;
console.log (body);

    this.httpService.post('./submit',JSON.stringify(body),{headers}).subscribe(data => {
      console.log(data.toString());
      alert(data.toString());
    },
    (err: HttpErrorResponse) => {
      console.log (err.message);
    }
  );

  }

// method which will set the width of thead cells with tbody cells value.
  setColumnWidths(): void
  {
    for(var i=0;i<document.getElementById('tblbodyData').getElementsByTagName('thead')[0].getElementsByTagName('tr')[0].getElementsByTagName('th').length;i++)
    {
      var ic=document.getElementById('tblbodyData').getElementsByTagName('thead')[0].getElementsByTagName('tr')[0].getElementsByTagName('th')[i].clientWidth;
      document.getElementById('fixedheaderrow').getElementsByTagName('tr')[0].getElementsByTagName('th')[i].style.width=(ic)+"px";
    }
  };

// updating the thead td widths to match with the tbody td's
  callUpdate():void{
    
   if(document.getElementById('tblbodyData').getElementsByTagName('tbody')[0].getElementsByTagName('tr').length>0){
      if(this.strFirstRow=='')
        {this.strFirstRow="1";this.setColumnWidths();}
   } ;
  }

  ngOnInit() {
    // get http call to retreive data from sample data json file
    this.httpService.get('./assets/sample_data.json').subscribe(
      data => {
        var n:number = 0;
        this.arrEmployeesObject = data as object [];
        this.arrEmployees=data as string [] ;
        this.totalrecords=this.arrEmployees.length;
        console.log("initial total records - "+this.totalrecords);

        this.calculateTotalPages();
        this.pages = this.getPages(this.pageNumber, this.totalPages);
        for(var property in this.arrEmployeesObject[0])
        {
          this.arrProperties[n++]=property;
        }
        
      
      },
      (err: HttpErrorResponse) => {
        console.log (err.message);
      }
    );
    
  }

}
