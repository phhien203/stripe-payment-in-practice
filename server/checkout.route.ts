import {Request, Response} from 'express';
import {db, getDocData} from './database';
import {Timestamp} from '@google-cloud/firestore';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

interface RequestInfo {
  courseId: string;
  callbackUrl: string;
}

export async function createCheckoutSession(req: Request, res: Response) {
  try {
    const info: RequestInfo = {
      courseId: req.body.courseId,
      callbackUrl: req.body.callbackUrl
    };

    console.log('Purchasing course with id', info.courseId);

    const purchaseSession = await db.collection('purchaseSessions').doc();

    const checkoutSessionData: any = {
      status: 'ongoing',
      created: Timestamp.now()
    };

    if (info.courseId) {
      checkoutSessionData.courseId = info.courseId;
    }

    await purchaseSession.set(checkoutSessionData);

    let sessionConfig;

    if (info.courseId) {
      const course = await getDocData(`courses/${info.courseId}`);
      sessionConfig = setupPurchaseCourseSession(info, course, purchaseSession.id);
    }

    console.log(sessionConfig);

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log(session);

    res.status(200).json({
      stripeCheckoutSessionId: session.id,
      stripePublicKey: process.env.STRIPE_PUBLIC_KEY
    });

  } catch (e) {
    console.log('Unexpected error occurred while purchasing course:', e);
    res.status(500).json({
      error: 'Could not initiate Stripe checkout session'
    });
  }
}

function setupPurchaseCourseSession(info: RequestInfo, course, sessionId: string) {
  const config = setupBaseSessionConfig(info, sessionId);

  config.line_items = [
    {
      name: course.titles.description,
      description: course.titles.longDescription,
      amount: course.price * 100,
      currency: 'usd',
      quantity: 1,
    },
  ];

  return config;
}

function setupBaseSessionConfig(info: RequestInfo, sessionId: string) {
  const config: any = {
    success_url: `${info.callbackUrl}/?purchaseResult=success`,
    cancel_url: `${info.callbackUrl}/?purchaseResult=failed`,
    payment_method_types: ['card'],
    client_reference_id: sessionId,
  };

  return config;
}
