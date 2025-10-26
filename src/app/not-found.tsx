import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl mb-8">Page non trouvée</p>
      <p className="text-muted-foreground mb-8">
        La page que vous recherchez a peut-être été supprimée, son nom a été modifié ou elle est temporairement indisponible.
      </p>
      <Button asChild>
        <Link href="/">Aller à la page d'accueil</Link>
      </Button>
    </div>
  );
}
