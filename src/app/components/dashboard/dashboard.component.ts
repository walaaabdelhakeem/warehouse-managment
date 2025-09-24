import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, RouterOutlet, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { ItemsService } from '../../servies/items.service';
import { ReturnsService } from '../../servies/returns.service';
import { ExpenseService } from '../../servies/expense.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements AfterViewInit, OnInit {
  features = [
    { label: 'إدخال صنف', link: 'item-entry', icon: 'bi bi-plus-square' },
    { label: 'اضافة اومر جديدة', link: 'purchase-orders', icon: 'bi bi-cart-plus' },
    { label: 'الوحدات', link: 'units', icon: 'bi bi-diagram-3' },
    { label: 'اضافة أرصدة', link: 'opening-balances', icon: 'bi bi-archive' },
    { label: 'الصرف من المستودع', link: 'dispatch', icon: 'bi bi-truck' },
    { label: 'مصروفات الوحدة', link: 'add-expense', icon: 'bi bi-cash-stack' },
    { label: 'مناقلة العهد', link: 'transfer', icon: 'bi bi-arrow-left-right' },
    { label: 'استلام الرجيع', link: 'returns', icon: 'bi bi-arrow-counterclockwise' },
    { label: 'إسقاط العهد', link: 'disposal', icon: 'bi bi-x-octagon' },
    { label: 'التقارير', link: 'reports', icon: 'bi bi-bar-chart' },
    { label: 'تقرير زمنى', link: 'timeline-report', icon: 'bi bi-clock-history' },
    { label: 'بحث عن مستلم', link: 'user-search', icon: 'bi bi-search' },
    { label: 'استعراض العمليات', link: 'operations-view', icon: 'bi bi-list-check' },
    { label: 'أضافة سجل العهدة', link: 'custodyrecord', icon: 'bi-clipboard-check' },
    { label: 'استعراض سجل العهدة', link: 'Review-custody', icon: 'bi bi-folder2-open' },
    { label: ' الاعدادات', link: 'admin', icon: 'bi bi-person-gear' }
  ];

  stats = [
    { label: 'إجمالي الأصناف', value: 0, icon: 'bi bi-box-seam', color: 'text-primary' },
    { label: 'إجمالي الوحدات', value: 0, icon: 'bi bi-123', color: 'text-success' },
    { label: 'مصروفات الشهر', value: 0, icon: 'bi bi-cash-coin', color: 'text-warning' },
    { label: 'إجمالي الرجيع', value: 0, icon: 'bi bi-arrow-counterclockwise', color: 'text-danger' }
  ];

  currentChild: string | null = null;
  userRole: string = '';

  constructor(private router: Router, private route: ActivatedRoute, private itemsservics: ItemsService, private returnservice: ReturnsService, private ExpenseService: ExpenseService) {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      const child = this.route.firstChild;
      this.currentChild = child && child.snapshot.url.length > 0 ? child.snapshot.url[0].path : null;
    });
  }

  ngAfterViewInit() {
    this.loadDashboardData();
  }

  ngOnInit() {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.userRole = (user.role || '').toLowerCase();
      } catch {
        this.userRole = '';
      }
    } else {
      this.userRole = '';
    }
    setInterval(() => this.loadDashboardData(), 2000);
  }

  loadDashboardData() {
    this.itemsservics.Getallitems().subscribe({
      next: (item) => {
        this.stats[0].value = item.length;
        this.items = item;
        this.updateItemsChart();
      }
    })
    this.ExpenseService.getUnits().subscribe({
      next: units => {
        this.stats[1].value = units.length;
        this.units = units;
      }
    });
    this.ExpenseService.getExpenses().subscribe(expenses => {
      this.stats[2].value = expenses.reduce((sum, e) => sum + e.amount, 0);
      this.expenses = expenses;
      this.updateExpensesChart();
    });
    this.returnservice.getReturns().subscribe(returns => {
      this.stats[3].value = returns.reduce((sum, r) => sum + r.quantity, 0);
      this.returns = returns;
    });
  }

  items: any[] = [];
  units: any[] = [];
  expenses: any[] = [];
  returns: any[] = [];

  updateItemsChart() {
    setTimeout(() => {
      const w = window as any;
      if (w.Chart) {
        const canvas = document.getElementById('itemsChart') as HTMLCanvasElement | null;
        const ctx1 = canvas ? canvas.getContext('2d') : null;
        if (ctx1) {
          new w.Chart(ctx1, {
            type: 'bar',
            data: {
              labels: this.items.map(i => i.itemName),
              datasets: [{
                label: 'عدد الأصناف',
                data: this.items.map(i => parseInt(i.stockNumber)),
                backgroundColor: '#4f8cff'
              }]
            },
            options: { responsive: true, plugins: { legend: { display: false } } }
          });
        }
      }
    }, 0);
  }

  updateExpensesChart() {
    setTimeout(() => {
      const w = window as any;
      if (w.Chart) {
        const canvas = document.getElementById('expensesChart') as HTMLCanvasElement | null;
        const ctx2 = canvas ? canvas.getContext('2d') : null;
        if (ctx2) {
          new w.Chart(ctx2, {
            type: 'pie',
            data: {
              labels: this.expenses.map(e => e.unitName),
              datasets: [{
                label: 'مصروفات',
                data: this.expenses.map(e => e.amount),
                backgroundColor: ['#3358e6', '#4f8cff', '#ffc107']
              }]
            },
            options: { responsive: true }
          });
        }
      }
    }, 0);
  }

  get filteredFeatures() {
    if (this.userRole === 'admin') {
      return this.features;
    } else {
      return this.features.filter(f => f.label.trim() !== 'الاعدادات' && f.label.trim() !== ' الاعدادات');
    }
  }

  isChildRouteActive(): boolean {
    return !!this.currentChild;
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
