import Link from 'next/link'

export default function RootPage() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Welcome to YouSong</h1>
      <p>AI-powered songs for children&apos;s ministry</p>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
        <Link href="/home">Go to Home</Link>
        <Link href="/login">Login</Link>
      </div>
    </div>
  )
}


export function generateMetadata() {
  return {
    title: 'YouSong'
  }
}
