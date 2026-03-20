import './globals.css'

export const metadata = {
  title: 'PathPilot — AI Adaptive Onboarding',
  description: 'Forge your path. Skip what you know.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}