import { redirect } from 'next/navigation';

export default function InventoryLowStockRedirect() {
  redirect('/pos/inventory?stock=low');
}
