import { Logo } from './logo';

export function WelcomeView() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-12">
        <div className="space-y-4">
            <Logo className="text-4xl justify-center text-primary" />
            <h1 className="text-2xl font-semibold font-headline text-foreground">Transforme Descrições de Projetos em Planos Acionáveis</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
                Cole uma descrição abaixo para começar e deixe nossa IA ajudá-lo a criar uma estratégia para seu próximo trabalho freelancer. Não se esqueça de adicionar suas habilidades na barra lateral para uma análise mais personalizada!
            </p>
        </div>
    </div>
  );
}
