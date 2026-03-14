import { Logo } from './logo';

export function WelcomeView() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-12 animate-in fade-in-50 duration-500">
        <div className="space-y-4 max-w-xl mx-auto">
            <h1 className="text-4xl font-semibold font-headline text-foreground/90">Olá! O que vamos planejar hoje?</h1>
            <p className="text-muted-foreground text-lg">
                Cole a descrição de um projeto, adicione suas habilidades na barra lateral e informe seu orçamento (opcional) para receber uma análise estratégica completa da IA.
            </p>
        </div>
    </div>
  );
}
