import { Card, CardContent, CardHeader, CardTitle, Button } from '@sunday-school/ui'
import { Music, Heart, BookOpen, Users } from 'lucide-react'
import Link from 'next/link'
import { siteConfig } from '@sunday-school/lib'
import { PageLayout } from '@/components/PageLayout'
import Footer from '@/components/landing/Footer'

export default function About() {
  return (
    <>
    <PageLayout>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            About {siteConfig.name}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Empowering Sunday School teachers and children&apos;s ministry leaders to create engaging, 
            Bible-centered songs that help children learn and remember God&apos;s Word through music.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="w-5 h-5 text-primary" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We believe music is a powerful tool for teaching children about God&apos;s love, 
                biblical stories, and Christian values. Our AI-powered platform makes it easy 
                for anyone to create custom Sunday School songs that engage young hearts and minds.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-secondary" />
                Why We Built This
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Sunday School teachers often struggle to find age-appropriate songs that match 
                their specific lessons. We created this tool to help educators craft personalized 
                songs that perfectly align with their curriculum and engage their students.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Bible-Centered Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Every song generated is rooted in biblical truth and designed to be 
                theologically sound while remaining fun and accessible for children ages 5-10. 
                Our AI is trained to create content that aligns with mainstream Christian teaching.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-secondary" />
                For Educators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Whether you&apos;re a seasoned Sunday School teacher, children&apos;s ministry leader, 
                or parent looking to make Bible learning more engaging, our platform provides 
                the tools you need to create memorable musical experiences.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium mt-1">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Share Your Vision</h4>
                  <p className="text-muted-foreground">Tell our AI about the Bible story, theme, or lesson you want to turn into a song.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium mt-1">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-foreground">AI Creates Lyrics</h4>
                  <p className="text-muted-foreground">Our AI generates age-appropriate, biblically accurate lyrics that match your requirements.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium mt-1">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Generate Music</h4>
                  <p className="text-muted-foreground">Transform your lyrics into a complete song with AI-generated music that&apos;s perfect for children.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium mt-1">
                  4
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Use in Your Ministry</h4>
                  <p className="text-muted-foreground">Download and use your custom songs in Sunday School, VBS, children&apos;s church, or at home.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/">
            <Button size="lg">
              Start Creating Songs
            </Button>
          </Link>
        </div>
    </PageLayout>
    <Footer />
    </>
  )
}