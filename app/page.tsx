/* ==================================================
   首页 - 重定向到 Dashboard
   ================================================== */

import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/dashboard');
}
