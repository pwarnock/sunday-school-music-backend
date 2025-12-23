import { Card, CardContent, CardHeader, CardTitle, Button } from '@sunday-school/ui'
import Link from 'next/link'
import { siteConfig } from '@sunday-school/lib'
import { PageLayout } from '@/components/PageLayout'
import Footer from '@/components/landing/Footer'

export default function Privacy() {
  return (
    <>
    <PageLayout>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Our Commitment to Privacy</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-foreground max-w-none">
            <p>
              At {siteConfig.name}, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-foreground max-w-none">
            <h4 className="font-semibold text-foreground mb-2">Account Information</h4>
            <p>When you create an account, we collect:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Email address (for authentication and account recovery)</li>
              <li>Authentication data (securely managed through Supabase Auth)</li>
              <li>Account creation date and last login information</li>
            </ul>

            <h4 className="font-semibold text-foreground mb-2 mt-6">Usage Information</h4>
            <p>We collect information about how you use our service:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Songs you create (lyrics, themes, and generated audio)</li>
              <li>Chat conversations with our AI assistant</li>
              <li>Song generation preferences and settings</li>
              <li>Credit usage and generation history</li>
            </ul>

            <h4 className="font-semibold text-foreground mb-2 mt-6">Technical Information</h4>
            <p>We automatically collect certain technical information:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>IP address and browser information</li>
              <li>Device type and operating system</li>
              <li>Usage patterns and feature interactions</li>
              <li>Error logs and performance data</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-foreground max-w-none">
            <p>We use the information we collect to:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Provide and maintain our song creation service</li>
              <li>Process your song generation requests</li>
              <li>Improve our AI models and service quality</li>
              <li>Communicate with you about your account and service updates</li>
              <li>Provide customer support and respond to inquiries</li>
              <li>Analyze usage patterns to enhance user experience</li>
              <li>Ensure service security and prevent abuse</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Information Sharing and Disclosure</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-foreground max-w-none">
            <p>We do not sell, trade, or otherwise transfer your personal information to third parties, except in the following limited circumstances:</p>
            
            <h4 className="font-semibold text-foreground mb-2 mt-4">Service Providers</h4>
            <p>We work with trusted third-party service providers:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Supabase:</strong> Database hosting and user authentication</li>
              <li><strong>ElevenLabs:</strong> AI music generation (lyrics and themes only)</li>
              <li><strong>Gloo AI:</strong> Chat AI functionality</li>
              <li><strong>Vercel:</strong> Web hosting and deployment</li>
            </ul>

            <h4 className="font-semibold text-foreground mb-2 mt-4">Legal Requirements</h4>
            <p>We may disclose your information if required to do so by law or in response to valid requests by public authorities.</p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Data Security</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-foreground max-w-none">
            <p>We implement appropriate security measures to protect your personal information:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>All data is encrypted in transit and at rest</li>
              <li>User authentication is handled securely through Supabase Auth</li>
              <li>API keys and sensitive data are stored securely and never exposed to the client</li>
              <li>Regular security updates and monitoring</li>
              <li>Access controls and audit logging</li>
            </ul>
            <p className="mt-4">
              However, no method of transmission over the Internet or electronic storage is 100% secure. 
              While we strive to use commercially acceptable means to protect your information, 
              we cannot guarantee its absolute security.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Data Retention</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-foreground max-w-none">
            <p>We retain your information for as long as your account is active or as needed to provide you services:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Account information is retained until you delete your account</li>
              <li>Generated songs and chat history are stored indefinitely unless you delete them</li>
              <li>Inactive accounts (no login for 12+ months) may have credits expire</li>
              <li>Usage logs and analytics data may be retained for up to 2 years</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Rights and Choices</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-foreground max-w-none">
            <p>You have the following rights regarding your personal information:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Access:</strong> Request access to your personal data</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
              <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
              <li><strong>Withdrawal:</strong> Withdraw consent for data processing where applicable</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, please contact us through our support channels or account settings.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Children&apos;s Privacy</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-foreground max-w-none">
            <p>
              While our service creates content for children, it is designed for use by adults (teachers, ministry leaders, and parents). 
              We do not knowingly collect personal information from children under 13. 
              If you believe a child has provided us with personal information, please contact us immediately.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>International Data Transfers</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-foreground max-w-none">
            <p>
              Your information may be transferred to and processed in countries other than your own. 
              We ensure that such transfers comply with applicable data protection laws and that 
              appropriate safeguards are in place to protect your information.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Changes to This Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-foreground max-w-none">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by 
              posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. 
              You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-foreground max-w-none">
            <p>
              If you have any questions about this Privacy Policy or our data practices, 
              please contact us through our support channels or visit our About page for more information.
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