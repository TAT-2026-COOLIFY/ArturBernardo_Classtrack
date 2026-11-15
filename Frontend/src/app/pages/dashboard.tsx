import { useEffect, useState } from "react";
import { Users, UsersRound, CreditCard, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { getAlunos } from "@/app/services/alunos";
import { getGrupos } from "@/app/services/grupos";
import { getPagamentos, type Pagamento } from "@/app/services/pagamentos";
import { getLessons } from "@/app/services/aulas";
import { getGroupLessons } from "@/app/services/aulasgrupos";
import { useTheme } from "@/app/contexts/theme-context";

export function Dashboard() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [stats, setStats] = useState({
    totalAlunos: 0,
    gruposAtivos: 0,
    pagamentosPendentes: 0,
    aulasAgendadas: 0,
  });

  const [selectedPeriod, setSelectedPeriod] = useState<"3" | "6" | "12">("6");
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, [selectedPeriod]);

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const [alunos, grupos, pagamentos, lessons, groupLessons] = await Promise.all([
        getAlunos(),
        getGrupos(),
        getPagamentos(),
        getLessons(),
        getGroupLessons(),
      ]);

      const pagamentosList = pagamentos ?? [];
      const pagamentosPendentes = pagamentosList.filter((p) => p.status === "pending").length;

      // Junta aulas individuais e em grupo, considerando data + hora de início
      const agora = new Date();
      const aulasFuturas = [
        ...(lessons ?? []).map((l) => new Date(`${l.date}T${l.start_at}`)),
        ...(groupLessons ?? []).map((g) => new Date(`${g.date}T${g.start_at}`)),
      ].filter((data) => data >= agora);

      setStats({
        totalAlunos: (alunos ?? []).length,
        gruposAtivos: (grupos ?? []).length,
        pagamentosPendentes,
        aulasAgendadas: aulasFuturas.length,
      });

      buildChartData(pagamentosList);
    } catch (err) {
      setError("Não foi possível carregar os dados do dashboard.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const buildChartData = (pagamentos: Pagamento[]) => {
    const months = parseInt(selectedPeriod);
    const hoje = new Date();
    const mesesData: { [key: string]: { recebido: number; aReceber: number; mes: string } } = {};

    for (let i = months - 1; i >= 0; i--) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mesKey = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
      const mesNome = data.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });

      mesesData[mesKey] = {
        mes: mesNome.charAt(0).toUpperCase() + mesNome.slice(1),
        recebido: 0,
        aReceber: 0,
      };
    }

    pagamentos.forEach((pag) => {
      const mesKey = pag.date.slice(0, 7); // "YYYY-MM-DD" -> "YYYY-MM"
      if (mesesData[mesKey]) {
        if (pag.status === "concluded") {
          mesesData[mesKey].recebido += Number(pag.value);
        } else {
          mesesData[mesKey].aReceber += Number(pag.value);
        }
      }
    });

    setChartData(Object.values(mesesData));
  };

  const statsData = [
    {
      title: "Total de Alunos",
      value: stats.totalAlunos.toString(),
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/50",
    },
    {
      title: "Grupos Ativos",
      value: stats.gruposAtivos.toString(),
      icon: UsersRound,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/50",
    },
    {
      title: "Pagamentos Pendentes",
      value: stats.pagamentosPendentes.toString(),
      icon: CreditCard,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/50",
    },
    {
      title: "Aulas Agendadas",
      value: stats.aulasAgendadas.toString(),
      icon: Calendar,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/50",
    },
  ];

  const totais = chartData.reduce(
    (acc, curr) => ({
      recebido: acc.recebido + curr.recebido,
      aReceber: acc.aReceber + curr.aReceber,
    }),
    { recebido: 0, aReceber: 0 }
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-2">Visão geral do seu sistema de gestão</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <p className="text-gray-500">Carregando...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsData.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`size-5 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold text-gray-900">{stat.value}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Gráfico de Pagamentos */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>Resumo de Pagamentos</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Comparativo de valores recebidos vs. a receber
                    </p>
                  </div>
                  <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
                    <SelectTrigger className="w-45">
                      <SelectValue placeholder="Selecione o período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">Últimos 3 meses</SelectItem>
                      <SelectItem value="6">Últimos 6 meses</SelectItem>
                      <SelectItem value="12">Últimos 12 meses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900/50">
                    <div className="text-sm text-green-600 dark:text-green-400 font-medium">Total Recebido</div>
                    <div className="text-2xl font-semibold text-green-700 dark:text-green-300 mt-1">
                      R$ {totais.recebido.toFixed(2)}
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-900/50">
                    <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Total a Receber</div>
                    <div className="text-2xl font-semibold text-yellow-700 dark:text-yellow-300 mt-1">
                      R$ {totais.aReceber.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="w-full h-100">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#27272a" : "#f0f0f0"} />
                      <XAxis
                        dataKey="mes"
                        tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 12 }}
                        axisLine={{ stroke: isDark ? "#3f3f46" : "#e5e7eb" }}
                      />
                      <YAxis
                        tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 12 }}
                        axisLine={{ stroke: isDark ? "#3f3f46" : "#e5e7eb" }}
                        tickFormatter={(value) => `R$ ${value}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? "#18181b" : "#fff",
                          border: `1px solid ${isDark ? "#27272a" : "#e5e7eb"}`,
                          borderRadius: "8px",
                          padding: "12px",
                          color: isDark ? "#f3f4f6" : "#111827",
                        }}
                        formatter={(value: any) => [`R$ ${value.toFixed(2)}`, ""]}
                        labelStyle={{ fontWeight: "bold", marginBottom: "8px", color: isDark ? "#f3f4f6" : "#111827" }}
                      />
                      <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />
                      <Bar dataKey="recebido" fill="#10b981" name="Recebido" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="aReceber" fill="#f59e0b" name="A Receber" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}