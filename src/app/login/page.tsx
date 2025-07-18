
'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Swords, TriangleAlert } from 'lucide-react';
import { isFirebaseEnabled } from '@/lib/firebase';

export default function LoginPage() {
  const { signInAsGuest } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Swords className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline">Magic Duel Assistant</CardTitle>
          <CardDescription>Нажмите, чтобы начать дуэль</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {!isFirebaseEnabled && (
             <Alert variant="destructive">
              <TriangleAlert className="h-4 w-4" />
              <AlertTitle>Firebase не настроен</AlertTitle>
              <AlertDescription>
                Пожалуйста, добавьте ваши учетные данные Firebase в файл .env, чтобы включить аутентификацию.
              </AlertDescription>
            </Alert>
          )}
          <Button onClick={signInAsGuest} variant="default" className="w-full" size="lg" disabled={!isFirebaseEnabled}>
            Войти как гость
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

    