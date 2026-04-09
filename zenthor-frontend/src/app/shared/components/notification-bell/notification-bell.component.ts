import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotificationService, Notification } from '../../../core/services/notification.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notification-bell',
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.css']
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  notificaciones: Notification[] = [];
  notificacionesNoLeidas = 0;
  dropdownOpen = false;
  private subscription: Subscription | undefined;

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.subscription = this.notificationService.notifications$.subscribe(notifs => {
      this.notificaciones = notifs.slice(0, 20);
      this.notificacionesNoLeidas = notifs.filter(n => !n.read).length;
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  marcarTodasLeidas(event: Event) {
    event.stopPropagation();
    this.notificationService.marcarTodasComoLeidas();
  }

  limpiarTodas(event: Event) {
    event.stopPropagation();
    this.notificationService.limpiarTodas();
  }

  irALink(link: string, notifId: string, event: Event) {
    event.stopPropagation();
    this.notificationService.marcarComoLeida(notifId);
    this.router.navigate([link]);
    this.dropdownOpen = false;
  }
}
