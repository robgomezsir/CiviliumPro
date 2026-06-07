"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  confere: number;
  naoConfere: number;
  erros: number;
};

const cores = ["#15803d", "#b91c1c", "#b45309"];

export function GraficoResultados({ confere, naoConfere, erros }: Props) {
  const data = [
    { nome: "CONFERE", total: confere },
    { nome: "NÃO CONFERE", total: naoConfere },
    { nome: "ERRO", total: erros },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="nome" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="total" radius={[4, 4, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={index} fill={cores[index]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
