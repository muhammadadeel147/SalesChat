'use client';

import { useState } from 'react';

export type FaqItem = {
  question: string;
  answer: string;
};

export function FAQAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-outline-variant/30 rounded-site border-2 border-dashed border-primary/40 bg-pure-white">
      {items.map((item, index) => {
        const open = openIndex === index;
        return (
          <div key={item.question}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={open}
              onClick={() => setOpenIndex(open ? null : index)}
            >
              <span className="text-body-md font-semibold text-on-surface sm:text-base">
                {item.question}
              </span>
              <span className="text-primary" aria-hidden="true">
                {open ? '−' : '+'}
              </span>
            </button>
            {open ? (
              <div className="px-5 pb-4 text-body-sm leading-relaxed text-on-surface-variant">
                {item.answer}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
