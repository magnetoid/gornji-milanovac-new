'use client';

import { useState } from 'react';
import { BookingInput } from '@/lib/api';

interface BookingFormProps {
  serviceId: string;
  vendorId: string;
  serviceName: string;
  durationMinutes?: number | null;
}

const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
];

export default function BookingForm({
  serviceId,
  vendorId,
  serviceName,
  durationMinutes,
}: BookingFormProps) {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    requested_date: '',
    requested_time: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const bookingData: BookingInput = {
        service_id: serviceId,
        vendor_id: vendorId,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone || undefined,
        requested_date: formData.requested_date,
        requested_time: formData.requested_time || '09:00',
        message: formData.message || undefined,
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        throw new Error('Failed to create booking');
      }

      setSubmitStatus('success');
      setFormData({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        requested_date: '',
        requested_time: '',
        message: '',
      });
    } catch (error) {
      console.error('Booking error:', error);
      setSubmitStatus('error');
      setErrorMessage('Došlo je do greške. Molimo pokušajte ponovo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  if (submitStatus === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-green-800 mb-2">Zahtev poslat!</h3>
        <p className="text-green-700 mb-4">
          Vaš zahtev za rezervaciju je uspešno poslat. Prodavac će vas kontaktirati u najkraćem roku.
        </p>
        <button
          onClick={() => setSubmitStatus('idle')}
          className="text-green-700 hover:text-green-800 font-medium underline"
        >
          Zakaži novi termin
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-primary/5 rounded-lg p-4 mb-4">
        <p className="text-sm text-text-muted">
          Rezerviši: <span className="font-medium text-text">{serviceName}</span>
        </p>
        {durationMinutes && (
          <p className="text-xs text-text-light mt-1">
            Trajanje: ~{durationMinutes} minuta
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="customer_name" className="block text-sm font-medium text-text mb-1">
            Ime i prezime *
          </label>
          <input
            type="text"
            id="customer_name"
            name="customer_name"
            value={formData.customer_name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            placeholder="Vaše ime"
          />
        </div>

        <div>
          <label htmlFor="customer_email" className="block text-sm font-medium text-text mb-1">
            Email *
          </label>
          <input
            type="email"
            id="customer_email"
            name="customer_email"
            value={formData.customer_email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            placeholder="vasa@email.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="customer_phone" className="block text-sm font-medium text-text mb-1">
          Telefon
        </label>
        <input
          type="tel"
          id="customer_phone"
          name="customer_phone"
          value={formData.customer_phone}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          placeholder="060 123 4567"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="requested_date" className="block text-sm font-medium text-text mb-1">
            Željeni datum *
          </label>
          <input
            type="date"
            id="requested_date"
            name="requested_date"
            value={formData.requested_date}
            onChange={handleChange}
            required
            min={today}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>

        <div>
          <label htmlFor="requested_time" className="block text-sm font-medium text-text mb-1">
            Željeno vreme
          </label>
          <select
            id="requested_time"
            name="requested_time"
            value={formData.requested_time}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          >
            <option value="">Izaberite vreme</option>
            {timeSlots.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-text mb-1">
          Napomena
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
          placeholder="Dodatne informacije ili zahtevi..."
        />
      </div>

      {submitStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 px-4 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Slanje...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Zakaži termin</span>
          </>
        )}
      </button>

      <p className="text-xs text-text-light text-center">
        * Obavezna polja. Prodavac će vas kontaktirati radi potvrde termina.
      </p>
    </form>
  );
}
