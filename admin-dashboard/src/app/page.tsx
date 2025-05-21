import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/dashboard');
  // Note: The redirect function must be called before any JSX is returned.
  // So, we don't return any JSX here.
}
