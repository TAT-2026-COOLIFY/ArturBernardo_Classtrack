import { useEffect, useState } from "react";
import { Plus, Check, X, Search, FileDown, Trash2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  getPagamentos,
  addPagamento,
  updatePagamento,
  deletePagamento,
  downloadPaymentsReport,
  type Pagamento,
  type PaymentStatus,
} from "@/app/services/pagamentos";
import { getAlunos, type Aluno } from "@/app/services/alunos";

const METODOS = [
  { value: "pix", label: "Pix" },
  { value: "card", label: "Cartão" },
  { value: "cash", label: "Dinheiro" },
  { value: "transferencia", label: "Transferência" },
];

const STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pendente",
  concluded: "Pago",
};

export function Pagamentos() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"todos" | PaymentStatus>("todos");
  const [filterMonth, setFilterMonth] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    alunoId: "",
    mes: "",
    valor: "",
    method: "pix",
    status: "pending" as PaymentStatus,
  });

  // Detalhes / exclusão
  const [selectedPagamento, setSelectedPagamento] = useState<Pagamento | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, [filterMonth]);

  const METODO_LABELS: Record<string, string> = METODOS.reduce(
    (acc, m) => ({ ...acc, [m.value]: m.label }),
    {}
  );
  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [pagamentosData, alunosData] = await Promise.all([
        getPagamentos(filterMonth || undefined),
        getAlunos(),
      ]);
      setPagamentos(pagamentosData ?? []);
      setAlunos(alunosData ?? []);
    } catch (err) {
      setError("Não foi possível carregar os pagamentos.");
      setPagamentos([]);
      setAlunos([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;

    setFormData({
      alunoId: "",
      mes: currentMonth,
      valor: "",
      method: "pix",
      status: "pending",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await addPagamento({
        learner_id: formData.alunoId,
        date: `${formData.mes}-01`,
        value: parseFloat(formData.valor),
        payment_method: formData.method,
        status: formData.status,
      });

      await loadData();
      handleCloseDialog();
    } catch (err) {
      setError("Erro ao registrar pagamento.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (pagamento: Pagamento) => {
    const newStatus: PaymentStatus =
      pagamento.status === "concluded" ? "pending" : "concluded";
    try {
      await updatePagamento(pagamento.id, { status: newStatus });
      await loadData();
    } catch (err) {
      setError("Erro ao atualizar status do pagamento.");
      console.error(err);
    }
  };

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    setError("");
    try {
      await downloadPaymentsReport(filterMonth || undefined);
    } catch (err) {
      setError("Erro ao gerar relatório.");
      console.error(err);
    } finally {
      setGeneratingReport(false);
    }
  };

  // Abre o card de detalhes ao clicar na linha
  const handleRowClick = (pagamento: Pagamento) => {
    setSelectedPagamento(pagamento);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedPagamento(null);
  };

  const handleDeleteClick = () => {
    setIsDetailsOpen(false);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPagamento) return;

    setDeleting(true);
    setError("");
    try {
      await deletePagamento(selectedPagamento.id);
      await loadData();
      setIsDeleteConfirmOpen(false);
      setSelectedPagamento(null);
    } catch (err) {
      setError("Erro ao excluir pagamento.");
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const getAlunoNome = (pagamento: Pagamento) => {
    if (pagamento.learner_name) return pagamento.learner_name;
    const aluno = alunos.find((a) => a.id === pagamento.learner_id);
    return aluno?.name || "Aluno não encontrado";
  };

  const formatMes = (date: string) => {
    const [ano, mesNum] = date.split("-");
    const meses = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
    ];
    return `${meses[parseInt(mesNum) - 1]} ${ano}`;
  };

  const filteredPagamentos = pagamentos.filter((pagamento) => {
    const alunoNome = getAlunoNome(pagamento);
    const matchSearch = alunoNome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "todos" || pagamento.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPago = pagamentos
    .filter((p) => p.status === "concluded")
    .reduce((sum, p) => sum + Number(p.value), 0);

  const totalPendente = pagamentos
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + Number(p.value), 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-semibold text-gray-900">Pagamentos</h2>
          <p className="text-gray-600 mt-2">Controle as mensalidades dos seus alunos</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleGenerateReport}
            disabled={generatingReport}
            className="gap-2"
          >
            <FileDown className="size-4" />
            {generatingReport ? "Gerando..." : "Gerar Relatório"}
          </Button>
          <Button onClick={handleOpenDialog} className="gap-2">
            <Plus className="size-4" />
            Registrar Pagamento
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pago</p>
                <p className="text-2xl font-semibold text-green-600 mt-1">
                  R$ {totalPago.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Check className="size-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pendente</p>
                <p className="text-2xl font-semibold text-yellow-600 mt-1">
                  R$ {totalPendente.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <X className="size-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Geral</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  R$ {(totalPago + totalPendente).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <Input
            placeholder="Buscar por nome do aluno..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="w-48"
        />
        <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="concluded">Pagos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <p className="text-gray-500">Carregando...</p>
        </div>
      ) : filteredPagamentos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">
              {searchTerm || filterStatus !== "todos" || filterMonth
                ? "Nenhum pagamento encontrado com esses filtros."
                : "Nenhum pagamento registrado ainda. Clique em 'Registrar Pagamento' para começar."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Mês</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPagamentos.map((pagamento) => (
                  <TableRow
                    key={pagamento.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleRowClick(pagamento)}
                  >
                    <TableCell className="font-medium">
                      {getAlunoNome(pagamento)}
                    </TableCell>
                    <TableCell>{formatMes(pagamento.date)}</TableCell>
                    <TableCell>R$ {Number(pagamento.value).toFixed(2)}</TableCell>
                    <TableCell className="capitalize">{METODO_LABELS[pagamento.method] ?? pagamento.method}</TableCell>
                    <TableCell>
                      <Badge
                        variant={pagamento.status === "concluded" ? "default" : "secondary"}
                        className={
                          pagamento.status === "concluded"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                        }
                      >
                        {STATUS_LABELS[pagamento.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(pagamento);
                        }}
                      >
                        {pagamento.status === "concluded" ? "Marcar Pendente" : "Marcar Pago"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Dialog de detalhes do pagamento */}
      <Dialog open={isDetailsOpen} onOpenChange={handleCloseDetails}>
        <DialogContent className="sm:max-w-105">
          {selectedPagamento && (
            <>
              <DialogHeader>
                <DialogTitle>Detalhes do Pagamento</DialogTitle>
                <DialogDescription>
                  Informações completas do pagamento selecionado.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Aluno</span>
                  <span className="font-medium text-gray-900">{getAlunoNome(selectedPagamento)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Mês de referência</span>
                  <span className="font-medium text-gray-900">{formatMes(selectedPagamento.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Valor</span>
                  <span className="font-medium text-gray-900">
                    R$ {Number(selectedPagamento.value).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Método</span>
                  <span className="font-medium text-gray-900 capitalize">{METODO_LABELS[selectedPagamento.method] ?? selectedPagamento.method}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Status</span>
                  <Badge
                    variant={selectedPagamento.status === "concluded" ? "default" : "secondary"}
                    className={
                      selectedPagamento.status === "concluded"
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                    }
                  >
                    {STATUS_LABELS[selectedPagamento.status]}
                  </Badge>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleDeleteClick}
                >
                  <Trash2 className="size-4 mr-2" />
                  Excluir
                </Button>
                <Button variant="outline" onClick={handleCloseDetails}>
                  Fechar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmação de exclusão */}
      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este pagamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction disabled={deleting} onClick={handleDeleteConfirm}>
              {deleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog para registrar pagamento */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
            <DialogDescription>
              Preencha os dados do pagamento abaixo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="alunoId">Aluno *</Label>
                {alunos.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Nenhum aluno cadastrado. Cadastre alunos primeiro.
                  </p>
                ) : (
                  <Select
                    value={formData.alunoId}
                    onValueChange={(value) => setFormData({ ...formData, alunoId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um aluno" />
                    </SelectTrigger>
                    <SelectContent>
                      {alunos.map((aluno) => (
                        <SelectItem key={aluno.id} value={String(aluno.id)}>
                          {aluno.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="mes">Mês *</Label>
                <Input
                  id="mes"
                  type="month"
                  required
                  value={formData.mes}
                  onChange={(e) => setFormData({ ...formData, mes: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor">Valor (R$) *</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  placeholder="150.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="method">Método *</Label>
                <Select
                  value={formData.method}
                  onValueChange={(value) => setFormData({ ...formData, method: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {METODOS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: PaymentStatus) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="concluded">Pago</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={alunos.length === 0 || saving}>
                {saving ? "Registrando..." : "Registrar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}