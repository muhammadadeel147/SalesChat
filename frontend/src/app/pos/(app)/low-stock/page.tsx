import { redirect } from 'next/navigation';

export default function LowStockRedirect() {
  redirect('/pos/inventory?stock=low');
}
