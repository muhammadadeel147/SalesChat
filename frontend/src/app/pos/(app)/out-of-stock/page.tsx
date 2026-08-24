import { redirect } from 'next/navigation';

export default function OutOfStockRedirect() {
  redirect('/pos/inventory?stock=out');
}
