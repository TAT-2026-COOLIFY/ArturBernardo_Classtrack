import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Plus,
  Pencil,
  Trash2,
  CreditCard,
  Loader2,
  Users,
  Search,
  Mail,
  Phone,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import {
  getPlanos,
  addPlano,
  updatePlano,
  deletePlano,
  type Plano,
} from "@/app/services/planos";
import { getAlunos, type Aluno } from "@/app/services/alunos";

const emptyForm = {
  title: "",
  description: "",
  value: "",
};

export function Planos() {
  const navigate = useNavigate();
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlano, setEditingPlano] = useState<Plano | null>(null);
  const [selectedPlanoForAlunos, setSelectedPlanoForAlunos] = useState<Plano | null>(null);
  const [alunoSearchTerm, setAlunoSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    loadPlanos();
    loadAlunos();
  }, []);

  const loadPlanos = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getPlanos();
      setPlanos(data ?? []);
    } catch (err) {
      setError("Não foi possível carregar os planos.");
      setPlanos([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAlunos = async () => {
    try {
      const data = await getAlunos();
      setAlunos(data ?? []);
    } catch (err) {
      console.error("Erro ao carregar alunos:", err);
    }
  };

  const handleOpenDialog = (plano?: Plano) => {
    if (plano) {
      setEditingPlano(plano);
      setFormData({
        title: plano.title,
        description: plano.description ?? "",
        value: plano.value.toString(),
      });
    } else {
      setEditingPlano(null);
      setFormData(emptyForm);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPlano(null);
  };

  const handleOpenAlunosModal = (plano: Plano) => {
    setSelectedPlanoForAlunos(plano);
    setAlunoSearchTerm("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const value = parseFloat(formData.value);
    if (isNaN(value) || value <= 0) {
      setError("Por favor, insira um valor válido.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        value,
      };

      if (editingPlano) {
        await updatePlano(editingPlano.id, payload);
      } else {
        await addPlano(payload);
      }

      await loadPlanos();
      handleCloseDialog();
    } catch (err) {
      setError("Erro ao salvar plano. Verifique os dados e tente novamente.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const alunosComPlano = alunos.filter((a) => a.plan_id === id);

    if (alunosComPlano.length > 0) {
      alert(
        `Não é possível excluir este plano pois ${alunosComPlano.length} aluno(s) estão associados a ele.`
      );
      return;
    }

    if (!confirm("Tem certeza que deseja excluir este plano?")) {
      return;
    }

    try {
      await deletePlano(id);
      await loadPlanos();
    } catch (err) {
      setError("Erro ao excluir plano.");
      console.error(err);
    }
  };

  const countAlunosNoPlano = (planoId: number) => {
    return alunos.filter((a) => a.plan_id === planoId).length;
  };

  const alunosDoPlano = selectedPlanoForAlunos
    ? alunos.filter((a) => a.plan_id === selectedPlanoForAlunos.id)
    : [];

  const alunosDoPlanoFiltrados = alunosDoPlano.filter((a) => {
    if (!alunoSearchTerm.trim()) return true;
    const term = alunoSearchTerm.toLowerCase();
    return (
      a.name.toLowerCase().includes(term) ||
      (a.email && a.email.toLowerCase().includes(term)) ||
      (a.contact && a.contact.toLowerCase().includes(term))
    );
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Planos</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gerencie os planos de assinatura e visualize os alunos de cada plano
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="size-4 mr-2" />
          Novo Plano
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 rounded-md text-sm border border-red-200 dark:border-red-900">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {planos.map((plano) => {
            const alunosCount = countAlunosNoPlano(plano.id);
            return (
              <Card
                key={plano.id}
                onClick={() => handleOpenAlunosModal(plano)}
                className="relative cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-blue-500/50 dark:hover:border-blue-400/50 group flex flex-col justify-between"
              >
                <div>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/60 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                          <CreditCard className="size-6" />
                        </div>
                        <div>
                          <CardTitle className="text-xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {plano.title}
                          </CardTitle>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs font-normal">
                        Ver alunos
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        R$ {plano.value.toFixed(2)}
                      </div>
                    </div>

                    {plano.description && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {plano.description}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </div>

                <div className="p-6 pt-0 space-y-3">
                  <div className="pt-3 border-t border-border flex items-center justify-between group-hover:bg-blue-50/50 dark:group-hover:bg-blue-950/20 -mx-6 px-6 py-2.5 transition-colors">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Users className="size-4 text-blue-600 dark:text-blue-400" />
                      <span>
                        <strong className="text-gray-900 dark:text-gray-100 font-semibold">
                          {alunosCount}
                        </strong>{" "}
                        aluno(s) neste plano
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 font-medium gap-0.5">
                      <span>Ver lista</span>
                      <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDialog(plano);
                      }}
                      className="flex-1"
                    >
                      <Pencil className="size-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(plano.id);
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}

          {planos.length === 0 && (
            <div className="col-span-full">
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CreditCard className="size-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 text-center">
                    Nenhum plano cadastrado ainda.
                    <br />
                    Clique em "Novo Plano" para começar.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Dialog para exibir os alunos associados ao plano */}
      <Dialog
        open={!!selectedPlanoForAlunos}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedPlanoForAlunos(null);
            setAlunoSearchTerm("");
          }
        }}
      >
        <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col">
          <DialogHeader className="pb-3 border-b">
            <div className="flex items-start justify-between pr-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-950/80 rounded-xl text-blue-600 dark:text-blue-400">
                  <CreditCard className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl">
                    {selectedPlanoForAlunos?.title}
                  </DialogTitle>
                  <DialogDescription className="text-sm mt-0.5">
                    R$ {selectedPlanoForAlunos?.value.toFixed(2)} •{" "}
                    <strong>{alunosDoPlano.length}</strong> aluno(s) matriculado(s)
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Filtro de pesquisa caso haja mais de 3 alunos */}
          {alunosDoPlano.length > 3 && (
            <div className="relative my-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Filtrar alunos por nome, e-mail ou contato..."
                value={alunoSearchTerm}
                onChange={(e) => setAlunoSearchTerm(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>
          )}

          {/* Lista de alunos */}
          <div className="flex-1 overflow-y-auto py-2 pr-1 space-y-2">
            {alunosDoPlano.length === 0 ? (
              <div className="py-10 px-4 text-center flex flex-col items-center justify-center">
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full mb-3 text-gray-400">
                  <Users className="size-8" />
                </div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Nenhum aluno neste plano
                </h4>
                <p className="text-sm text-gray-500 max-w-sm mb-4">
                  Não há alunos vinculados a este plano no momento. Você pode vincular alunos editando o cadastro deles na página de Alunos.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedPlanoForAlunos(null);
                    navigate("/alunos");
                  }}
                  className="gap-2"
                >
                  Ir para Alunos
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            ) : alunosDoPlanoFiltrados.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">
                Nenhum aluno encontrado para "{alunoSearchTerm}".
              </div>
            ) : (
              alunosDoPlanoFiltrados.map((aluno) => (
                <div
                  key={aluno.id}
                  className="p-3.5 rounded-lg border border-border bg-card hover:bg-accent/40 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-semibold text-sm flex items-center justify-center shrink-0">
                      {aluno.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                        {aluno.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 text-xs text-gray-500">
                        {aluno.email && (
                          <span className="flex items-center gap-1 truncate">
                            <Mail className="size-3 text-gray-400" />
                            {aluno.email}
                          </span>
                        )}
                        {aluno.contact && (
                          <span className="flex items-center gap-1">
                            <Phone className="size-3 text-gray-400" />
                            {aluno.contact}
                          </span>
                        )}
                      </div>
                      {aluno.observation && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1 italic">
                          "{aluno.observation}"
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-xs gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    onClick={() => {
                      setSelectedPlanoForAlunos(null);
                      navigate("/alunos");
                    }}
                    title="Ver página de Alunos"
                  >
                    Ver aluno
                    <ChevronRight className="size-3.5" />
                  </Button>
                </div>
              ))
            )}
          </div>

          <DialogFooter className="pt-3 border-t flex sm:justify-between items-center">
            <span className="text-xs text-gray-500 hidden sm:inline">
              Total: {alunosDoPlano.length} aluno(s)
            </span>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedPlanoForAlunos(null);
                setAlunoSearchTerm("");
              }}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para adicionar/editar plano */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPlano ? "Editar Plano" : "Novo Plano"}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações do plano de assinatura.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Nome do Plano</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Ex: Plano Premium"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Descreva o que está incluído neste plano"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">Valor (R$)</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: e.target.value })
                  }
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Salvando..." : editingPlano ? "Salvar Alterações" : "Criar Plano"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}