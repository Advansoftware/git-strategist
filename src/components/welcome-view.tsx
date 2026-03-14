import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card } from '@/components/ui/card';
import { Logo } from './logo';

export function WelcomeView() {
  const welcomeImage = PlaceHolderImages.find(img => img.id === 'welcome-image');

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <Card className="p-8 max-w-2xl w-full bg-card/80 backdrop-blur-sm">
            {welcomeImage && (
                <Image
                src={welcomeImage.imageUrl}
                alt={welcomeImage.description}
                width={400}
                height={300}
                className="mx-auto rounded-lg mb-6 shadow-md"
                data-ai-hint={welcomeImage.imageHint}
                />
            )}
            <Logo className="text-3xl justify-center mb-2 text-primary" />
            <h1 className="text-xl font-semibold font-headline mb-2 text-foreground">Turn Project Descriptions into Actionable Plans</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
                Paste a brief below to get started and let our AI help you strategize your next freelance gig. Don't forget to add your skills in the sidebar for a more personalized analysis!
            </p>
        </Card>
    </div>
  );
}
