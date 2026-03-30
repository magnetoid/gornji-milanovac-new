'use client';

import { useState } from 'react';

interface ContactVendorFormProps {
  vendorEmail: string | null;
  vendorPhone: string | null;
  vendorName: string;
  productName?: string;
}

export default function ContactVendorForm({
  vendorEmail,
  vendorPhone,
  vendorName,
  productName,
}: ContactVendorFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: productName
      ? `Zainteresovan/a sam za proizvod: ${productName}\n\n`
      : '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!vendorEmail) return;

    const subject = productName
      ? `Upit za: ${productName}`
      : `Upit sa Gornji Milanovac portala`;

    const body = `
Ime: ${formData.name}
Email: ${formData.email}
Telefon: ${formData.phone || 'Nije naveden'}

Poruka:
${formData.message}
    `.trim();

    const mailtoLink = `mailto:${vendorEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  return (
    <div className="space-y-4">
      <div className="bg-primary/5 rounded-lg p-4">
        <h4 className="font-medium text-text mb-2">Kontaktiraj: {vendorName}</h4>

        {/* Direct contact options */}
        <div className="space-y-2">
          {vendorPhone && (
            <a
              href={`tel:${vendorPhone.replace(/[^0-9+]/g, '')}`}
              className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="font-medium">{vendorPhone}</span>
            </a>
          )}

          {vendorEmail && (
            <a
              href={`mailto:${vendorEmail}`}
              className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{vendorEmail}</span>
            </a>
          )}
        </div>
      </div>

      {vendorEmail && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-text-muted">ili pošaljite upit</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="contact_name" className="block text-sm font-medium text-text mb-1">
                Vaše ime *
              </label>
              <input
                type="text"
                id="contact_name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                placeholder="Ime i prezime"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="contact_email" className="block text-sm font-medium text-text mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  id="contact_email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                  placeholder="vasa@email.com"
                />
              </div>

              <div>
                <label htmlFor="contact_phone" className="block text-sm font-medium text-text mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  id="contact_phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                  placeholder="060 123 4567"
                />
              </div>
            </div>

            <div>
              <label htmlFor="contact_message" className="block text-sm font-medium text-text mb-1">
                Poruka *
              </label>
              <textarea
                id="contact_message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none text-sm"
                placeholder="Vaša poruka..."
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Pošalji upit</span>
            </button>

            <p className="text-xs text-text-light text-center">
              Otvoriće se vaš email klijent sa popunjenim podacima.
            </p>
          </form>
        </>
      )}
    </div>
  );
}
