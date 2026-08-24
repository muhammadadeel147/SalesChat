'use client';

import { useState, type FormEvent } from 'react';
import { Button } from './Button';
import { MaterialIcon } from './MaterialIcon';

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  inquiryType: string;
  message: string;
};

const initial: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  inquiryType: 'sales',
  message: '',
};

export function ContactForm() {
  const [values, setValues] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  function validate(next: FormState) {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (!next.firstName.trim()) nextErrors.firstName = 'First name is required';
    if (!next.lastName.trim()) nextErrors.lastName = 'Last name is required';
    if (!next.email.trim()) nextErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email))
      nextErrors.email = 'Enter a valid email';
    if (!next.message.trim()) nextErrors.message = 'Message is required';
    else if (next.message.trim().length < 10)
      nextErrors.message = 'Please write at least 10 characters';
    return nextErrors;
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSubmitted(true);
    setValues(initial);
  }

  const inputClass =
    'w-full rounded-xl bg-surface-container-low px-3 py-2.5 text-body-sm text-on-surface placeholder:text-on-surface-variant/50 transition-all focus:outline-none focus:ring-2 focus:ring-primary-container/50 sm:px-4 sm:py-3 sm:text-body-md';

  return (
    <form onSubmit={onSubmit} className="relative z-10 space-y-4 sm:space-y-5" noValidate>
      {submitted ? (
        <p
          className="rounded-xl border border-primary-container bg-primary-container/30 px-4 py-3 text-body-sm text-on-primary-container"
          role="status"
        >
          Thanks — your message is ready. We&apos;ll reply during business hours.
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="firstName" className="text-body-sm text-on-surface-variant">
            First Name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            placeholder="Jane"
            value={values.firstName}
            onChange={(e) => setValues((v) => ({ ...v, firstName: e.target.value }))}
            className={inputClass}
            aria-invalid={Boolean(errors.firstName)}
          />
          {errors.firstName ? <p className="text-xs text-red-600">{errors.firstName}</p> : null}
        </div>
        <div className="space-y-2">
          <label htmlFor="lastName" className="text-body-sm text-on-surface-variant">
            Last Name
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            placeholder="Doe"
            value={values.lastName}
            onChange={(e) => setValues((v) => ({ ...v, lastName: e.target.value }))}
            className={inputClass}
            aria-invalid={Boolean(errors.lastName)}
          />
          {errors.lastName ? <p className="text-xs text-red-600">{errors.lastName}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-body-sm text-on-surface-variant">
          Work Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="jane.doe@company.com"
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          className={inputClass}
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email ? <p className="text-xs text-red-600">{errors.email}</p> : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="inquiryType" className="text-body-sm text-on-surface-variant">
          Inquiry Type
        </label>
        <div className="relative">
          <select
            id="inquiryType"
            name="inquiryType"
            value={values.inquiryType}
            onChange={(e) => setValues((v) => ({ ...v, inquiryType: e.target.value }))}
            className={`${inputClass} cursor-pointer appearance-none`}
          >
            <option value="sales">Sales & Demo Request</option>
            <option value="support">Technical Support</option>
            <option value="partnership">Partnership Inquiry</option>
            <option value="other">Other</option>
          </select>
          <MaterialIcon
            name="expand_more"
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-body-sm text-on-surface-variant">
          How can we help?
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder="Tell us about your current operational challenges..."
          value={values.message}
          onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
          className={`${inputClass} resize-none`}
          aria-invalid={Boolean(errors.message)}
        />
        {errors.message ? <p className="text-xs text-red-600">{errors.message}</p> : null}
      </div>

      <Button type="submit" size="md" className="group/btn w-full md:w-auto">
        Send Message
        <MaterialIcon
          name="arrow_forward"
          className="transition-transform group-hover/btn:translate-x-1"
        />
      </Button>
    </form>
  );
}
