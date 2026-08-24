import { redirect } from 'next/navigation';

export default function InventoryOutOfStockRedirect() {
  redirect('/pos/inventory?stock=out');
}
