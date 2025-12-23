import { Card, CardContent, CardHeader, CardTitle, Button } from '@sunday-school/ui'
import Link from 'next/link'
import { siteConfig } from '@sunday-school/lib'
import { PageLayout } from '@/components/PageLayout'
import Footer from '@/components/landing/Footer'

export default function Terms() {
  return (
    <>
    <PageLayout>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-foreground max-w-none">
            <p>
              By accessing and using {siteConfig.name} (&quot;the Service&quot;), you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Use License</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-foreground max-w-none">
            <p>Permission is granted to temporarily use {siteConfig.name} for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>modify or copy the materials</li>
              <li>use the materials for any commercial purpose or for any public display (commercial or non-commercial)</li>
              <li>attempt to decompile or reverse engineer any software contained on the website</li>
              <li>remove any copyright or other proprietary notations from the materials</li>
            </ul>
            <p className="mt-4">
              Songs created using our service are yours to use for educational and ministry purposes. However, you may not resell or redistribute the generated content commercially without permission.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>User Accounts and Credits</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-foreground max-w-none">
            <p>
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. 
              You are responsible for safeguarding the password and for all activities that occur under your account.
            </p>
            <p className="mt-4">
              Each user receives 3 free song generation credits upon account creation. These credits are non-transferable and expire if the account is inactive for more than 12 months.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Content Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-foreground max-w-none">
            <p>
              {siteConfig.name} is designed specifically for creating Christian educational content for children. All generated content should be:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Appropriate for children ages 5-10</li>
              <li>Biblically accurate and aligned with mainstream Christian teaching</li>
              <li>Educational and suitable for Sunday School or children&apos;s ministry use</li>
              <li>Free from inappropriate, offensive, or harmful content</li>
            </ul>
            <p className="mt-4">
              We reserve the right to refuse service or remove content that violates these guidelines.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-foreground max-w-none">
            <p>
              The songs you create using our service are generated based on your input and are yours to use for educational and ministry purposes. 
              However, the underlying technology, software, and service remain our intellectual property.
            </p>
            <p className="mt-4">
              You retain rights to use the generated songs in your ministry, classroom, or personal educational activities. 
              Commercial use or redistribution requires separate permission.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Service Availability</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-foreground max-w-none">
            <p>
              We strive to maintain high availability but cannot guarantee uninterrupted service. 
              The service may be temporarily unavailable due to maintenance, updates, or technical issues.
            </p>
            <p className="mt-4">
              We reserve the right to modify, suspend, or discontinue the service at any time with reasonable notice to users.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-foreground max-w-none">
            <p>
              In no event shall {siteConfig.name} or its suppliers be liable for any damages (including, without limitation, 
              damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use 
              the materials on the website, even if authorized representative has been notified orally or in writing of the 
              possibility of such damage. Because some jurisdictions do not allow limitations on implied warranties, or 
              limitations of liability for consequential or incidental damages, these limitations may not apply to you.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-foreground max-w-none">
            <p>
              We reserve the right to revise these terms of service at any time without notice. 
              By using this service, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-foreground max-w-none">
            <p>
              If you have any questions about these Terms of Service, please contact us through our support channels 
              or by visiting our About page for more information.
            </p>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/">
            <Button size="lg">
              Back to {siteConfig.name}
            </Button>
          </Link>
        </div>
    </PageLayout>
    <Footer />
    </>
  )
}