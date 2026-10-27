// Kept outside admin/(panel), whose layout redirects signed-out users here;
// nested under it, the login page redirected to itself forever.
// The page reads ?callbackUrl / ?error, so render it per request.
export const dynamic = 'force-dynamic';

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
