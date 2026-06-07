"use client";

import { IconCheck } from "@tabler/icons-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  captchaImage?: string | null;
  isLoading?: boolean;
  onConfirmar: (captcha: string) => void;
};

export function CaptchaViewer({ captchaImage, isLoading, onConfirmar }: Props) {
  const [captcha, setCaptcha] = useState("");

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle>Aguardando resolução do CAPTCHA</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">
          Digite os caracteres exibidos abaixo para continuar a consulta na
          Receita Federal.
        </p>
        {captchaImage ? (
          <div className="flex justify-center rounded-lg border border-slate-200 bg-slate-50 p-4">
            <img
              src={`data:image/png;base64,${captchaImage}`}
              alt="CAPTCHA da Receita Federal"
              className="max-h-24"
            />
          </div>
        ) : (
          <div className="flex h-24 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            {isLoading ? "Carregando CAPTCHA..." : "CAPTCHA não disponível"}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="captcha">Caracteres do CAPTCHA</Label>
          <Input
            id="captcha"
            value={captcha}
            onChange={(e) => setCaptcha(e.target.value)}
            placeholder="Digite os caracteres"
            autoComplete="off"
            disabled={!captchaImage || isLoading}
          />
        </div>
        <Button
          size="lg"
          className="w-full"
          disabled={!captcha.trim() || !captchaImage || isLoading}
          onClick={() => onConfirmar(captcha.trim())}
        >
          <IconCheck className="h-5 w-5" />
          Confirmar CAPTCHA
        </Button>
      </CardContent>
    </Card>
  );
}
