import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  ExternalLink,
  Navigation,
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: 'general',
    message: '',
  });

  const LAB_ADDRESS =
    '101 S Lincoln Blvd, Centralia, IL 62801';

  const GOOGLE_MAPS_URL =
    'https://www.google.com/maps/search/?api=1&query=101%20S%20Lincoln%20Blvd%2C%20Centralia%2C%20IL%2062801';

  const GOOGLE_DIRECTIONS_URL =
    'https://www.google.com/maps/dir/?api=1&destination=101%20S%20Lincoln%20Blvd%2C%20Centralia%2C%20IL%2062801';

  const GOOGLE_MAP_EMBED_URL =
    'https://www.google.com/maps?q=101+S+Lincoln+Blvd,+Centralia,+IL+62801&output=embed';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      return;
    }

    setSending(true);
    setError('');

    try {
      const response = await fetch(
        'https://serine-diagnostics.onrender.com/api/contact/inquiry',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Unable to send inquiry.'
        );
      }

      setSubmitted(true);
    } catch (err) {
      console.error('Inquiry submission error:', err);

      setError(
        'Unable to send your inquiry right now. Please try again.'
      );
    } finally {
      setSending(false);
    }
  };

  const handleChange = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (error) {
      setError('');
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setError('');
    setFormData({
      name: '',
      email: '',
      phone: '',
      inquiryType: 'general',
      message: '',
    });
  };

  return (
    <div className="bg-[#f6fafb] min-h-screen py-10 sm:py-16 text-left">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* =========================================================
            PAGE HEADER
        ========================================================= */}
        <div className="max-w-3xl">

          <span className="text-xs font-extrabold text-[#168d90] uppercase tracking-wider">
            Get In Touch
          </span>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#103d4a] mt-1 tracking-tight">
            Contact Serine Diagnostics
          </h1>

          <p className="text-sm sm:text-base text-[#57737c] mt-3 leading-relaxed">
            Have questions about test preparation, physician ordering,
            home phlebotomy dispatch, or billing? Our Centralia patient
            care team is ready to assist you.
          </p>

        </div>


        {/* =========================================================
            CONTACT INFORMATION + FORM
        ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* =======================================================
              CONTACT DETAILS
          ======================================================= */}
          <div className="lg:col-span-5 space-y-6">

            <div className="bg-[#103d4a] text-white p-8 rounded-3xl space-y-6 shadow-md">

              <h3 className="text-xl font-extrabold">
                Centralia Laboratory HQ
              </h3>

              <div className="space-y-4 text-xs text-[#b8d7e0]">

                {/* ADDRESS */}
                <div className="flex items-start gap-3">

                  <MapPin className="w-4 h-4 text-[#86ded9] flex-shrink-0 mt-0.5" />

                  <div>

                    <strong className="text-white block text-sm">
                      Central Reference Laboratory
                    </strong>

                    <span>
                      {LAB_ADDRESS}
                    </span>

                  </div>

                </div>


                {/* PHONE */}
                <div className="flex items-start gap-3">

                  <Phone className="w-4 h-4 text-[#86ded9] flex-shrink-0 mt-0.5" />

                  <div>

                    <strong className="text-white block text-sm">
                      Main Phone & Inquiries
                    </strong>

                    <span>
                     872-330-7679/ 872-330-7679
                    </span>

                  </div>

                </div>


                {/* FAX */}
                <div className="flex items-start gap-3">

                  <Phone className="w-4 h-4 text-[#86ded9] flex-shrink-0 mt-0.5" />

                  <div>

                    <strong className="text-white block text-sm">
                      Physician Order Fax Line
                    </strong>

                    <span>
                      872-330-7679 (24/7 Electronic Reception)
                    </span>

                  </div>

                </div>


                {/* EMAIL */}
                <div className="flex items-start gap-3">

                  <Mail className="w-4 h-4 text-[#86ded9] flex-shrink-0 mt-0.5" />

                  <div>

                    <strong className="text-white block text-sm">
                      Electronic Inquiries
                    </strong>

                    <span>
                      clientcare@serinediagnostics.com
                    </span>

                  </div>

                </div>


                {/* HOURS */}
                <div className="flex items-start gap-3">

                  <Clock className="w-4 h-4 text-[#86ded9] flex-shrink-0 mt-0.5" />

                  <div>

                    <strong className="text-white block text-sm">
                      Operating Hours
                    </strong>

                    <span>
                      Mon–Fri: 6:30 AM – 6:00 PM | Sat: 7:00 AM – 2:00 PM
                    </span>

                  </div>

                </div>

              </div>

            </div>


            {/* PHYSICIAN INFORMATION */}
            <div className="p-6 rounded-3xl bg-white border border-[#dce8ea] text-xs text-[#4b6b75] space-y-2">

              <strong className="text-[#103d4a] block text-sm">
                Physician Requisitions & STAT Pickups:
              </strong>

              <p>
                For urgent STAT specimen courier dispatch from Centralia
                medical offices, please call our direct dispatch
                coordinator at <strong>872-330-7679</strong>.
              </p>

            </div>

          </div>


          {/* =======================================================
              CONTACT INQUIRY FORM
          ======================================================= */}
          <div
            id="contact-inquiry"
            className="lg:col-span-7 bg-white p-8 rounded-3xl border border-[#dce8ea] shadow-sm scroll-mt-24"
          >

            {submitted ? (

              /* SUCCESS MESSAGE */
              <div className="py-12 text-center space-y-4">

                <div className="w-16 h-16 rounded-full bg-[#e3f7f2] text-[#189872] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <h3 className="text-2xl font-extrabold text-[#103d4a]">
                  Message Sent Successfully
                </h3>

                <p className="text-xs sm:text-sm text-[#5d7a83] max-w-md mx-auto">
                  Thank you for contacting Serine Diagnostics.
                  A patient care representative will review your
                  message and reply promptly.
                </p>

                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 rounded-xl bg-[#e8f6f4] text-[#168d90] font-bold text-xs cursor-pointer hover:bg-[#dff2ef] transition-colors"
                >
                  Send Another Inquiry
                </button>

              </div>

            ) : (

              /* CONTACT FORM */
              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >

                <div>

                  <h3 className="text-xl font-extrabold text-[#103d4a]">
                    Send Us an Inquiry
                  </h3>

                  <p className="text-xs text-[#66838d] mt-0.5">
                    Fill out the form below and our team will get in touch.
                  </p>

                </div>


                {/* FORM FIELDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">

                  {/* FULL NAME */}
                  <div>

                    <label className="block text-xs font-bold text-[#294c57] mb-1">
                      Your Full Name *
                    </label>

                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        handleChange('name', e.target.value)
                      }
                      placeholder="e.g. John Smith"
                      className="w-full p-3 bg-[#f8fbfb] border border-[#d6e4e6] rounded-xl text-xs text-[#103d4a] outline-none focus:border-[#168d90]"
                    />

                  </div>


                  {/* EMAIL */}
                  <div>

                    <label className="block text-xs font-bold text-[#294c57] mb-1">
                      Email Address *
                    </label>

                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        handleChange('email', e.target.value)
                      }
                      placeholder="john@example.com"
                      className="w-full p-3 bg-[#f8fbfb] border border-[#d6e4e6] rounded-xl text-xs text-[#103d4a] outline-none focus:border-[#168d90]"
                    />

                  </div>


                  {/* PHONE */}
                  <div>

                    <label className="block text-xs font-bold text-[#294c57] mb-1">
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        handleChange('phone', e.target.value)
                      }
                      placeholder="(312) 555-0100"
                      className="w-full p-3 bg-[#f8fbfb] border border-[#d6e4e6] rounded-xl text-xs text-[#103d4a] outline-none focus:border-[#168d90]"
                    />

                  </div>


                  {/* INQUIRY TYPE */}
                  <div>

                    <label className="block text-xs font-bold text-[#294c57] mb-1">
                      Inquiry Type
                    </label>

                    <select
                      value={formData.inquiryType}
                      onChange={(e) =>
                        handleChange(
                          'inquiryType',
                          e.target.value
                        )
                      }
                      className="w-full p-3 bg-[#f8fbfb] border border-[#d6e4e6] rounded-xl text-xs text-[#103d4a] outline-none focus:border-[#168d90]"
                    >

                      <option value="general">
                        General Patient Question
                      </option>

                      <option value="booking">
                        Appointment / Test Scheduling
                      </option>

                      <option value="physician">
                        Physician Requisition / Account
                      </option>

                      <option value="billing">
                        Insurance & Billing Support
                      </option>

                    </select>

                  </div>

                </div>


                {/* MESSAGE */}
                <div>

                  <label className="block text-xs font-bold text-[#294c57] mb-1">
                    Your Message *
                  </label>

                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) =>
                      handleChange(
                        'message',
                        e.target.value
                      )
                    }
                    placeholder="How can we assist you with your diagnostic test or visit?..."
                    className="w-full p-3 bg-[#f8fbfb] border border-[#d6e4e6] rounded-xl text-xs text-[#103d4a] outline-none focus:border-[#168d90]"
                  />

                </div>


                {/* ERROR */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                    {error}
                  </div>
                )}


                {/* SEND */}
                <button
                  type="submit"
                  disabled={sending}
                  className="px-6 py-3 rounded-xl bg-[#168d90] hover:bg-[#117a7d] text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >

                  <Send className="w-4 h-4" />

                  {sending
                    ? 'Sending...'
                    : 'Send Inquiry'}

                </button>

              </form>

            )}

          </div>

        </div>


        {/* =========================================================
            GOOGLE MAP LOCATION SECTION
            ========================================================= */}
        <section className="pt-2">

          {/* SECTION HEADER */}
          <div className="text-center mb-7">

            <span className="text-xs font-extrabold text-[#168d90] uppercase tracking-wider">
              Find Us
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#103d4a] mt-1">
              Visit Our Centralia Laboratory
            </h2>

            <p className="text-sm text-[#5d7780] mt-2 max-w-2xl mx-auto">
              Conveniently located at our Central Reference Laboratory
              in Centralia. Use the map below to find directions to our facility.
            </p>

          </div>


          {/* MAP CONTAINER */}
          <div className="relative w-full h-[420px] sm:h-[500px] rounded-3xl overflow-hidden border border-[#d6e5e7] shadow-lg bg-[#eaf3f4]">

            {/* GOOGLE MAP */}
            <iframe
              title="Serine Diagnostics Centralia Laboratory Location"
              src={GOOGLE_MAP_EMBED_URL}
              className="absolute inset-0 w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />


            {/* =====================================================
                LOCATION CARD - TOP LEFT
            ===================================================== */}
            <div className="absolute top-4 left-4 sm:top-5 sm:left-5 z-10 w-[calc(100%-2rem)] sm:w-[360px]">

              <div className="bg-white rounded-2xl shadow-xl border border-[#dce8ea] overflow-hidden">

                <div className="p-5">

                  {/* TITLE */}
                  <div className="flex items-start gap-3">

                    <div className="w-11 h-11 rounded-xl bg-[#e8f6f4] text-[#168d90] flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">

                      <p className="text-[10px] font-extrabold text-[#168d90] uppercase tracking-wider">
                        Serine Diagnostics
                      </p>

                      <h3 className="text-base font-extrabold text-[#103d4a] mt-0.5">
                        Central Reference Laboratory
                      </h3>

                    </div>

                  </div>


                  {/* ADDRESS */}
                  <p className="text-xs text-[#5b747d] leading-relaxed mt-4 pl-0">
                    {LAB_ADDRESS}
                  </p>


                  {/* HOURS */}
                  <div className="flex items-center gap-2 mt-3">

                    <Clock className="w-3.5 h-3.5 text-[#168d90]" />

                    <span className="text-[11px] font-semibold text-[#526e77]">
                      Mon–Fri: 6:30 AM – 6:00 PM
                    </span>

                  </div>


                  {/* BUTTONS */}
                  <div className="grid grid-cols-2 gap-2 mt-4">

                    {/* OPEN MAP */}
                    <a
                      href={GOOGLE_MAPS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#168d90] hover:bg-[#117a7d] text-white text-[11px] font-bold transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open Maps
                    </a>


                    {/* DIRECTIONS */}
                    <a
                      href={GOOGLE_DIRECTIONS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#103d4a] hover:bg-[#0b2c36] text-white text-[11px] font-bold transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Directions
                    </a>

                  </div>

                </div>

              </div>

            </div>


            {/* =====================================================
                MOBILE MAP OVERLAY
            ===================================================== */}
            <div className="absolute bottom-4 left-4 right-4 sm:hidden z-10">

              <div className="bg-white/95 backdrop-blur-md rounded-xl px-4 py-3 shadow-lg border border-white">

                <div className="flex items-center gap-2">

                  <MapPin className="w-4 h-4 text-[#168d90] flex-shrink-0" />

                  <span className="text-[11px] font-bold text-[#103d4a]">
                    101 S Lincoln Blvd, Centralia, IL 62801
                  </span>

                </div>

              </div>

            </div>

          </div>


          {/* =====================================================
              BOTTOM LOCATION INFO
          ===================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">

            {/* ADDRESS */}
            <div className="bg-white border border-[#dce8ea] rounded-2xl p-5 flex items-start gap-3">

              <div className="w-9 h-9 rounded-lg bg-[#e8f6f4] text-[#168d90] flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4" />
              </div>

              <div>

                <h4 className="text-xs font-extrabold text-[#103d4a]">
                  Laboratory Address
                </h4>

                <p className="text-[11px] text-[#627b83] mt-1 leading-relaxed">
                  {LAB_ADDRESS}
                </p>

              </div>

            </div>


            {/* PHONE */}
            <div className="bg-white border border-[#dce8ea] rounded-2xl p-5 flex items-start gap-3">

              <div className="w-9 h-9 rounded-lg bg-[#e8f6f4] text-[#168d90] flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4" />
              </div>

              <div>

                <h4 className="text-xs font-extrabold text-[#103d4a]">
                  Phone
                </h4>

                <a
                  href="tel:3125557376"
                  className="text-[11px] text-[#168d90] font-bold mt-1 block hover:underline"
                >
                  872-330-7679
                </a>

              </div>

            </div>


            {/* HOURS */}
            <div className="bg-white border border-[#dce8ea] rounded-2xl p-5 flex items-start gap-3">

              <div className="w-9 h-9 rounded-lg bg-[#e8f6f4] text-[#168d90] flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4" />
              </div>

              <div>

                <h4 className="text-xs font-extrabold text-[#103d4a]">
                  Lab Hours
                </h4>

                <p className="text-[11px] text-[#627b83] mt-1 leading-relaxed">
                  Mon–Fri: 6:30 AM – 6:00 PM
                  <br />
                  Sat: 7:00 AM – 2:00 PM
                </p>

              </div>

            </div>

          </div>

        </section>

      </div>

    </div>
  );
};

