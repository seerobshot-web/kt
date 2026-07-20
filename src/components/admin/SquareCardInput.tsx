"use client";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

export interface SquareCardInputHandle {
  tokenize: () => Promise<string>;
}

interface Props {
  containerId?: string;
}

// Plain/functional styling on purpose — this is the admin-only virtual
// terminal, reusing the exact same Web Payments SDK pattern used on
// /checkout (payments.card() -> attach() -> tokenize()) without touching
// the customer-facing checkout code or its design system.
const SquareCardInput = forwardRef<SquareCardInputHandle, Props>(function SquareCardInput(
  { containerId = 'admin-card-container' },
  ref
) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'unconfigured' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const cardRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    tokenize: async () => {
      if (!cardRef.current) throw new Error('Payment form is not ready yet.');
      const result = await cardRef.current.tokenize();
      if (result.status === 'OK' && result.token) return result.token;
      const errors = result.errors?.map((e: any) => e.message).join(', ') || 'Card entry failed.';
      throw new Error(errors);
    },
  }));

  useEffect(() => {
    const applicationId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID;
    const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;
    if (!applicationId || !locationId) {
      setStatus('unconfigured');
      setMessage('Square is not configured yet.');
      return;
    }

    let cancelled = false;
    setStatus('loading');

    const init = async () => {
      try {
        const payments = await (window as any).Square.payments(applicationId, locationId);
        if (cancelled) return;
        const card = await payments.card();
        if (cancelled) {
          card.destroy();
          return;
        }
        cardRef.current = card;
        await card.attach(`#${containerId}`);
        if (cancelled) {
          card.destroy();
          cardRef.current = null;
          return;
        }
        setStatus('ready');
      } catch (err) {
        console.error('Square admin card init error', err);
        if (!cancelled) {
          setStatus('error');
          setMessage('The card form failed to load. Refresh and try again.');
        }
      }
    };

    if ((window as any).Square) {
      init();
    } else {
      const env = (process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT || 'sandbox').toLowerCase();
      const src = env === 'production' ? 'https://web.squarecdn.com/v1/square.js' : 'https://sandbox.web.squarecdn.com/v1/square.js';
      let script = document.querySelector<HTMLScriptElement>('script[data-square-sdk]');
      if (!script) {
        script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.dataset.squareSdk = 'true';
        document.head.appendChild(script);
      }
      script.addEventListener('load', init);
      script.addEventListener('error', () => {
        if (!cancelled) {
          setStatus('error');
          setMessage('The card form could not be loaded.');
        }
      });
    }

    return () => {
      cancelled = true;
      if (cardRef.current) {
        cardRef.current.destroy();
        cardRef.current = null;
      }
    };
  }, [containerId]);

  return (
    <div>
      <div id={containerId} className={status === 'ready' ? 'p-3 bg-white border border-gray-300 rounded' : 'h-0 overflow-hidden'} />
      {status === 'loading' && <div className="p-3 text-sm text-gray-500">Loading card form...</div>}
      {(status === 'unconfigured' || status === 'error') && (
        <div data-testid="admin-card-error" className="p-3 bg-red-50 border border-red-300 text-red-700 text-sm rounded">
          {message}
        </div>
      )}
    </div>
  );
});

export default SquareCardInput;
