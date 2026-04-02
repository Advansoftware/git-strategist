'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Settings, Award, FileText, BookOpen, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SkillManagerSettings } from '@/components/skill-manager-settings';
import { KnowledgeBaseSettings } from '@/components/knowledge-base-settings';
import { AboutSettings } from '@/components/about-settings';

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-screen">
      {/* Header bar */}
      <header className="p-4 border-b shrink-0 h-16 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </header>

      {/* Scrollable content */}
      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto p-6 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-6 w-6 text-muted-foreground" />
            <h1 className="text-2xl font-semibold">Configurações</h1>
          </div>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais para análises mais precisas.
          </p>

          <Tabs defaultValue="skills" className="space-y-4">
            <TabsList>
              <TabsTrigger value="skills" className="gap-2">
                <Award className="h-4 w-4" />
                Habilidades
              </TabsTrigger>
              <TabsTrigger value="about" className="gap-2">
                <User className="h-4 w-4" />
                Sobre Mim
              </TabsTrigger>
              <TabsTrigger value="knowledge" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Base de Aprendizado
              </TabsTrigger>
              <TabsTrigger value="proposals" className="gap-2">
                <FileText className="h-4 w-4" />
                Propostas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="skills">
              <Card>
                <CardHeader>
                  <CardTitle>Habilidades</CardTitle>
                  <CardDescription>
                    Adicione ou remova habilidades do seu perfil. Elas são usadas
                    pela IA para gerar análises mais precisas.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SkillManagerSettings />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="about">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Sobre Mim
                  </CardTitle>
                  <CardDescription>
                    Descreva sua experiência, projetos anteriores e preferências. A IA usa
                    essas informações para estimar prazos e esforço com mais precisão.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AboutSettings />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="knowledge">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Base de Aprendizado
                  </CardTitle>
                  <CardDescription>
                    Cole propostas vencedoras. A IA analisa os pontos fortes e usa como
                    referência para gerar melhores estratégias.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <KnowledgeBaseSettings />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="proposals">
              <Card>
                <CardHeader>
                  <CardTitle>Propostas</CardTitle>
                  <CardDescription>
                    Em breve: gerencie propostas e modelos de proposta salvos aqui.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-12">
                    <p className="text-muted-foreground">
                      Em breve: gerencie suas propostas salvas aqui.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}
