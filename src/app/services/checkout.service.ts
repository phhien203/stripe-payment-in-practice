import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CheckoutSession} from '../model/checkout-session.model';

declare const Stripe;

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  constructor(
    private http: HttpClient
  ) {
  }

  startCourseCheckoutSession(courseId: string): Observable<CheckoutSession> {
    return this.http.post<CheckoutSession>('/api/checkout', {
      courseId,
      callbackUrl: this.buildCallbackUrl()
    });
  }

  buildCallbackUrl() {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;

    let callbackUrl = `${protocol}//${hostname}`;

    if (port) {
      callbackUrl += ':' + port;
    }

    callbackUrl += '/stripe-checkout';

    return callbackUrl;
  }

  redirectToCheckoutFE(session: CheckoutSession) {
    const stripe = Stripe(session.stripePublicKey);
    stripe.redirectToCheckout({
      sessionId: session.stripeCheckoutSessionId
    });
  }
}
