import { useState, useEffect } from "react";
import { Plus, ChevronLeft, ChevronRight, Clock, User, Users as UsersIcon, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { cn } from "@/app/components/ui/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Badge } from "@/app/components/ui/badge";
import {
  getLessons,
  addLesson,
  updateLesson,
  deleteLesson,
  type Lesson,
} from "@/app/services/aulas";
import {
  getGroupLessons,
  addGroupLesson,
  updateGroupLesson,
  deleteGroupLesson,
  type GroupLesson,
} from "@/app/services/aulasgrupos";
import { getAlunos, type Aluno } from "@/app/services/alunos";
import { getGrupos, type Grupo } from "@/app/services/grupos";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";

interface AulaUnificada {
  id: number;
  tipo: "individual" | "grupo";
  date: string;
  start_at: string;
  end_at: string;
  nome: string;
  refId: number; // learner_id ou group_id, usado no form de edição
}

export function Calendario() {
  const [aulas, setAulas] = useState<AulaUnificada[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"month" | "list">("month");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    tipo: "individual" as "individual" | "grupo",
    alunoId: "",
    grupoId: "",
    data: "",
    horaInicio: "",
    horaFim: "",
    quantidade: "1",
  });

  // Detalhes / edição
  const [selectedAula, setSelectedAula] = useState<AulaUnificada | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    alunoId: "",
    grupoId: "",
    data: "",
    horaInicio: "",
    horaFim: "",
  });
  const [detailsError, setDetailsError] = useState("");
  const [detailsSaving, setDetailsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [lessons, groupLessons, alunosData, gruposData] = await Promise.all([
        getLessons(),
        getGroupLessons(),
        getAlunos(),
        getGrupos(),
      ]);

      const alunosList = alunosData ?? [];
      const gruposList = gruposData ?? [];

      const aulasIndividuais: AulaUnificada[] = (lessons ?? []).map((l: Lesson) => ({
        id: l.id,
        tipo: "individual",
        date: l.date,
        start_at: l.start_at,
        end_at: l.end_at,
        nome: l.learner?.name ?? alunosList.find((a) => a.id === l.learner_id)?.name ?? "Aluno não encontrado",
        refId: l.learner_id,
      }));

      const aulasGrupo: AulaUnificada[] = (groupLessons ?? []).map((g: GroupLesson) => ({
        id: g.id,
        tipo: "grupo",
        date: g.date,
        start_at: g.start_at,
        end_at: g.end_at,
        nome: g.group?.title ?? gruposList.find((gr) => gr.id === g.group_id)?.title ?? "Grupo não encontrado",
        refId: g.group_id,
      }));

      setAulas([...aulasIndividuais, ...aulasGrupo]);
      setAlunos(alunosList);
      setGrupos(gruposList);
    } catch (err) {
      setError("Não foi possível carregar as aulas.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (date?: Date) => {
    const dateToUse = date || new Date();
    const dateStr = format(dateToUse, "yyyy-MM-dd");
    const timeStr = format(dateToUse, "HH:mm");

    setFormData({
      tipo: "individual",
      alunoId: "",
      grupoId: "",
      data: dateStr,
      horaInicio: timeStr,
      horaFim: "",
      quantidade: "1",
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

    const occurrences = parseInt(formData.quantidade) || 1;

    try {
      if (formData.tipo === "individual") {
        await addLesson({
          learner_id: formData.alunoId,
          date: formData.data,
          start_at: formData.horaInicio,
          end_at: formData.horaFim,
          occurrences,
        });
      } else {
        await addGroupLesson({
          group_id: formData.grupoId,
          date: formData.data,
          start_at: formData.horaInicio,
          end_at: formData.horaFim,
          occurrences,
        });
      }

      await loadData();
      handleCloseDialog();
    } catch (err: any) {
      const apiMessage =
        err.response?.data?.errors?.start_at?.[0] ??
        err.response?.data?.message ??
        "Erro ao agendar aula. Verifique os dados e tente novamente.";
      setError(apiMessage);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Abre o card de detalhes ao clicar em uma aula
  const handleAulaClick = (aula: AulaUnificada) => {
    setSelectedAula(aula);
    setIsEditing(false);
    setDetailsError("");
    setEditFormData({
      alunoId: aula.tipo === "individual" ? String(aula.refId) : "",
      grupoId: aula.tipo === "grupo" ? String(aula.refId) : "",
      data: aula.date,
      horaInicio: aula.start_at.slice(0, 5),
      horaFim: aula.end_at.slice(0, 5),
    });
    setIsDetailsDialogOpen(true);
  };

  const handleCloseDetailsDialog = () => {
    setIsDetailsDialogOpen(false);
    setSelectedAula(null);
    setIsEditing(false);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAula) return;

    setDetailsSaving(true);
    setDetailsError("");

    try {
      if (selectedAula.tipo === "individual") {
        await updateLesson(selectedAula.id, {
          learner_id: editFormData.alunoId,
          date: editFormData.data,
          start_at: editFormData.horaInicio,
          end_at: editFormData.horaFim,
        });
      } else {
        await updateGroupLesson(selectedAula.id, {
          group_id: editFormData.grupoId,
          date: editFormData.data,
          start_at: editFormData.horaInicio,
          end_at: editFormData.horaFim,
        });
      }

      await loadData();
      handleCloseDetailsDialog();
    } catch (err: any) {
      const apiMessage =
        err.response?.data?.errors?.start_at?.[0] ??
        err.response?.data?.message ??
        "Erro ao atualizar aula. Verifique os dados e tente novamente.";
      setDetailsError(apiMessage);
      console.error(err);
    } finally {
      setDetailsSaving(false);
    }
  };

  const handleDeleteFromDetails = async () => {
    if (!selectedAula) return;
    if (!confirm("Deseja realmente excluir esta aula?")) return;

    try {
      if (selectedAula.tipo === "individual") {
        await deleteLesson(selectedAula.id);
      } else {
        await deleteGroupLesson(selectedAula.id);
      }
      await loadData();
      handleCloseDetailsDialog();
    } catch (err) {
      setDetailsError("Erro ao excluir aula.");
      console.error(err);
    }
  };

  const getAulaDateTime = (aula: AulaUnificada) => new Date(`${aula.date}T${aula.start_at}`);

  const getDuracaoMinutos = (aula: AulaUnificada) => {
    const inicio = new Date(`${aula.date}T${aula.start_at}`);
    const fim = new Date(`${aula.date}T${aula.end_at}`);
    return Math.round((fim.getTime() - inicio.getTime()) / 60000);
  };

  const getAulasForDate = (date: Date) => {
    return aulas.filter((aula) => isSameDay(getAulaDateTime(aula), date));
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const upcomingAulas = aulas
    .filter((aula) => getAulaDateTime(aula) >= new Date())
    .sort((a, b) => getAulaDateTime(a).getTime() - getAulaDateTime(b).getTime())
    .slice(0, 10);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-semibold text-foreground">Calendário</h2>
          <p className="text-muted-foreground mt-2">Agende e visualize suas aulas</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "month" ? "default" : "outline"}
            onClick={() => setViewMode("month")}
            className={viewMode === "month" ? "" : "border-border text-foreground hover:bg-accent"}
          >
            Calendário
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => setViewMode("list")}
            className={viewMode === "list" ? "" : "border-border text-foreground hover:bg-accent"}
          >
            Lista
          </Button>
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="size-4" />
            Nova Aula
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50 rounded-md text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      ) : viewMode === "month" ? (
        <Card className="border-border shadow-xs">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold tracking-tight text-foreground capitalize">
                {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border text-foreground hover:bg-accent"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  title="Mês anterior"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border text-foreground hover:bg-accent font-medium"
                  onClick={() => setCurrentMonth(new Date())}
                >
                  Hoje
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border text-foreground hover:bg-accent"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  title="Próximo mês"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
              {calendarDays.map((day) => {
                const dayAulas = getAulasForDate(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isToday = isSameDay(day, new Date());

                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "min-h-28 border rounded-xl p-2 transition-colors flex flex-col justify-between",
                      isCurrentMonth
                        ? "bg-card dark:bg-muted/15 border-border hover:border-border/80"
                        : "bg-muted/30 dark:bg-muted/5 border-border/40 opacity-50 dark:opacity-35",
                      isToday && "border-blue-500 dark:border-blue-500 border-2 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={cn(
                            "text-xs rounded-full size-6 flex items-center justify-center transition-colors",
                            isToday
                              ? "bg-blue-600 text-white font-bold"
                              : isCurrentMonth
                              ? "text-foreground font-semibold"
                              : "text-muted-foreground"
                          )}
                        >
                          {format(day, "d")}
                        </span>
                        {isCurrentMonth && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="size-6 p-0 text-muted-foreground hover:text-foreground hover:bg-accent/80 rounded-md"
                            onClick={() => handleOpenDialog(day)}
                            title="Adicionar aula neste dia"
                          >
                            <Plus className="size-3.5" />
                          </Button>
                        )}
                      </div>
                      <div className="space-y-1">
                        {dayAulas.map((aula) => {
                          const isGroup = aula.tipo === "grupo";
                          return (
                            <div
                              key={`${aula.tipo}-${aula.id}`}
                              className={cn(
                                "text-xs p-1.5 rounded-md cursor-pointer transition-all border shadow-2xs",
                                isGroup
                                  ? "bg-purple-50 text-purple-900 border-purple-200/80 hover:bg-purple-100 dark:bg-purple-950/70 dark:text-purple-200 dark:border-purple-800/60 dark:hover:bg-purple-900/60"
                                  : "bg-blue-50 text-blue-900 border-blue-200/80 hover:bg-blue-100 dark:bg-blue-950/70 dark:text-blue-200 dark:border-blue-800/60 dark:hover:bg-blue-900/60"
                              )}
                              onClick={() => handleAulaClick(aula)}
                              title={`${aula.nome} (${aula.start_at} - ${aula.end_at})`}
                            >
                              <div className="truncate font-semibold tracking-tight">{aula.nome}</div>
                              <div className="truncate text-[11px] opacity-80 flex items-center gap-1 mt-0.5">
                                <Clock className="size-2.5 shrink-0 inline" />
                                <span>{aula.start_at}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border shadow-xs">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold tracking-tight text-foreground mb-4">Próximas Aulas</h3>
            {upcomingAulas.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhuma aula agendada.</p>
            ) : (
              <div className="space-y-3">
                {upcomingAulas.map((aula) => (
                  <div
                    key={`${aula.tipo}-${aula.id}`}
                    className="border border-border rounded-xl p-4 bg-card hover:bg-accent/40 dark:hover:bg-accent/20 transition-all cursor-pointer shadow-xs"
                    onClick={() => handleAulaClick(aula)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-foreground">
                          {aula.tipo === "grupo" ? `Aula em grupo` : `Aula individual`}
                        </h4>
                        <div className="mt-2 space-y-1.5">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="size-4 shrink-0 text-muted-foreground" />
                            <span>
                              {format(getAulaDateTime(aula), "dd/MM/yyyy", { locale: ptBR })} • {aula.start_at} às {aula.end_at} ({getDuracaoMinutos(aula)} min)
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {aula.tipo === "grupo" ? (
                              <>
                                <UsersIcon className="size-4 shrink-0 text-muted-foreground" />
                                <Badge
                                  variant="secondary"
                                  className="bg-purple-100 text-purple-900 border border-purple-200/80 dark:bg-purple-950/70 dark:text-purple-200 dark:border-purple-800/60 font-medium"
                                >
                                  {aula.nome}
                                </Badge>
                              </>
                            ) : (
                              <>
                                <User className="size-4 shrink-0 text-muted-foreground" />
                                <span className="text-foreground font-medium">{aula.nome}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialog para criar aula */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>Agendar Nova Aula</DialogTitle>
            <DialogDescription>Preencha os dados da aula abaixo.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de aula *</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value: "individual" | "grupo") =>
                    setFormData({ ...formData, tipo: value, alunoId: "", grupoId: "" })
                  }
                >
                  <SelectTrigger id="tipo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="grupo">Em grupo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.tipo === "individual" ? (
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
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="grupoId">Grupo *</Label>
                  {grupos.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      Nenhum grupo cadastrado. Cadastre grupos primeiro.
                    </p>
                  ) : (
                    <Select
                      value={formData.grupoId}
                      onValueChange={(value) => setFormData({ ...formData, grupoId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um grupo" />
                      </SelectTrigger>
                      <SelectContent>
                        {grupos.map((grupo) => (
                          <SelectItem key={grupo.id} value={String(grupo.id)}>
                            {grupo.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="data">Data *</Label>
                <Input
                  id="data"
                  type="date"
                  required
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="horaInicio">Início *</Label>
                  <Input
                    id="horaInicio"
                    type="time"
                    required
                    value={formData.horaInicio}
                    onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horaFim">Fim *</Label>
                  <Input
                    id="horaFim"
                    type="time"
                    required
                    value={formData.horaFim}
                    onChange={(e) => setFormData({ ...formData, horaFim: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantidade">Quantidade de aulas *</Label>
                  <Input
                    id="quantidade"
                    type="number"
                    min="1"
                    max="52"
                    required
                    value={formData.quantidade}
                    onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Repete semanalmente, no mesmo dia da semana e horário. Ex: 4 aulas a partir de hoje (sábado) marca também os 3 próximos sábados.
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={saving} className="border-border text-foreground hover:bg-accent">
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  saving ||
                  (formData.tipo === "individual" ? alunos.length === 0 : grupos.length === 0)
                }
              >
                {saving ? "Agendando..." : "Agendar Aula"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de detalhes / edição da aula */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={handleCloseDetailsDialog}>
        <DialogContent className="sm:max-w-125">
          {selectedAula && (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  {isEditing ? "Editar Aula" : selectedAula.tipo === "grupo" ? "Aula em Grupo" : "Aula Individual"}
                </DialogTitle>
                {!isEditing && (
                  <DialogDescription>
                    Detalhes da aula agendada.
                  </DialogDescription>
                )}
              </DialogHeader>

              {detailsError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50 rounded-md text-sm">
                  {detailsError}
                </div>
              )}

              {!isEditing ? (
                <>
                  <div className="space-y-3 py-2">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      {selectedAula.tipo === "grupo" ? (
                        <UsersIcon className="size-4 text-muted-foreground shrink-0" />
                      ) : (
                        <User className="size-4 text-muted-foreground shrink-0" />
                      )}
                      <span className="font-semibold text-foreground">{selectedAula.nome}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="size-4 text-muted-foreground shrink-0" />
                      <span>
                        {format(getAulaDateTime(selectedAula), "dd/MM/yyyy", { locale: ptBR })} • {selectedAula.start_at} às {selectedAula.end_at} ({getDuracaoMinutos(selectedAula)} min)
                      </span>
                    </div>
                    <div>
                      <Badge
                        variant="secondary"
                        className={
                          selectedAula.tipo === "grupo"
                            ? "bg-purple-100 text-purple-900 border border-purple-200/80 dark:bg-purple-950/70 dark:text-purple-200 dark:border-purple-800/60 font-medium"
                            : "bg-blue-100 text-blue-900 border border-blue-200/80 dark:bg-blue-950/70 dark:text-blue-200 dark:border-blue-800/60 font-medium"
                        }
                      >
                        {selectedAula.tipo === "grupo" ? "Em grupo" : "Individual"}
                      </Badge>
                    </div>
                  </div>
                  <DialogFooter className="gap-2">
                    <Button
                      variant="outline"
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900/40"
                      onClick={handleDeleteFromDetails}
                    >
                      <Trash2 className="size-4 mr-2" />
                      Excluir
                    </Button>
                    <Button onClick={() => setIsEditing(true)}>
                      <Pencil className="size-4 mr-2" />
                      Editar
                    </Button>
                  </DialogFooter>
                </>
              ) : (
                <form onSubmit={handleSaveEdit}>
                  <div className="space-y-4 py-2">
                    {selectedAula.tipo === "individual" ? (
                      <div className="space-y-2">
                        <Label htmlFor="editAlunoId">Aluno *</Label>
                        <Select
                          value={editFormData.alunoId}
                          onValueChange={(value) => setEditFormData({ ...editFormData, alunoId: value })}
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
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="editGrupoId">Grupo *</Label>
                        <Select
                          value={editFormData.grupoId}
                          onValueChange={(value) => setEditFormData({ ...editFormData, grupoId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um grupo" />
                          </SelectTrigger>
                          <SelectContent>
                            {grupos.map((grupo) => (
                              <SelectItem key={grupo.id} value={String(grupo.id)}>
                                {grupo.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="editData">Data *</Label>
                      <Input
                        id="editData"
                        type="date"
                        required
                        value={editFormData.data}
                        onChange={(e) => setEditFormData({ ...editFormData, data: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="editHoraInicio">Início *</Label>
                        <Input
                          id="editHoraInicio"
                          type="time"
                          required
                          value={editFormData.horaInicio}
                          onChange={(e) => setEditFormData({ ...editFormData, horaInicio: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editHoraFim">Fim *</Label>
                        <Input
                          id="editHoraFim"
                          type="time"
                          required
                          value={editFormData.horaFim}
                          onChange={(e) => setEditFormData({ ...editFormData, horaFim: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-border text-foreground hover:bg-accent"
                      onClick={() => {
                        setIsEditing(false);
                        setDetailsError("");
                      }}
                      disabled={detailsSaving}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={detailsSaving}>
                      {detailsSaving ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                  </DialogFooter>
                </form>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}