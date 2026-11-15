import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Users } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Card, CardContent } from "@/app/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
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
import { Checkbox } from "@/app/components/ui/checkbox";
import {
  getGrupos,
  addGrupo,
  updateGrupo,
  deleteGrupo,
  type Grupo,
} from "@/app/services/grupos";
import { getAlunos, type Aluno } from "@/app/services/alunos";

export function Grupos() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingGrupo, setEditingGrupo] = useState<Grupo | null>(null);
  const [grupoToDelete, setGrupoToDelete] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    learner_ids: [] as number[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [gruposData, alunosData] = await Promise.all([getGrupos(), getAlunos()]);
      setGrupos(gruposData ?? []);
      setAlunos(alunosData ?? []);
    } catch (err) {
      setError("Não foi possível carregar os grupos.");
      setGrupos([]);
      setAlunos([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (grupo?: Grupo) => {
    if (grupo) {
      setEditingGrupo(grupo);
      setFormData({
        title: grupo.title,
        description: grupo.description,
        learner_ids: grupo.learners.map((a) => a.id),
      });
    } else {
      setEditingGrupo(null);
      setFormData({
        title: "",
        description: "",
        learner_ids: [],
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingGrupo(null);
  };

  const handleToggleAluno = (alunoId: number) => {
    setFormData((prev) => ({
      ...prev,
      learner_ids: prev.learner_ids.includes(alunoId)
        ? prev.learner_ids.filter((id) => id !== alunoId)
        : [...prev.learner_ids, alunoId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (editingGrupo) {
        await updateGrupo(editingGrupo.id, formData);
      } else {
        await addGrupo(formData);
      }
      await loadData();
      handleCloseDialog();
    } catch (err) {
      setError("Erro ao salvar grupo. Verifique os dados e tente novamente.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setGrupoToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (grupoToDelete) {
      try {
        await deleteGrupo(grupoToDelete);
        await loadData();
      } catch (err) {
        setError("Erro ao excluir grupo.");
        console.error(err);
      }
    }
    setIsDeleteDialogOpen(false);
    setGrupoToDelete(null);
  };

  const filteredGrupos = grupos.filter((grupo) =>
    grupo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    grupo.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-semibold text-gray-900">Grupos</h2>
          <p className="text-gray-600 mt-2">Organize seus alunos em grupos</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="size-4" />
          Criar Grupo
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <Input
            placeholder="Buscar grupos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <p className="text-gray-500">Carregando...</p>
        </div>
      ) : filteredGrupos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">
              {searchTerm
                ? "Nenhum grupo encontrado com esse termo de busca."
                : "Nenhum grupo criado ainda. Clique em 'Criar Grupo' para começar."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGrupos.map((grupo) => (
            <Card key={grupo.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{grupo.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{grupo.description}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(grupo)}>
                      <Edit className="size-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(grupo.id)}>
                      <Trash2 className="size-4 text-red-600" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <Users className="size-4" />
                  <span>{grupo.learners.length} alunos</span>
                </div>
                {grupo.learners.length > 0 && (
                  <div className="space-y-1">
                    {grupo.learners.map((aluno) => (
                      <div
                        key={aluno.id}
                        className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded"
                      >
                        {aluno.name}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog para criar/editar grupo */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingGrupo ? "Editar Grupo" : "Criar Novo Grupo"}</DialogTitle>
            <DialogDescription>
              {editingGrupo
                ? "Atualize as informações do grupo abaixo."
                : "Preencha os dados do novo grupo e selecione os alunos."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Nome do grupo *</Label>
                <Input
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Turma da Manhã"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o grupo..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Alunos do grupo</Label>
                {alunos.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Nenhum aluno cadastrado. Cadastre alunos primeiro para adicioná-los ao grupo.
                  </p>
                ) : (
                  <div className="border rounded-lg p-4 space-y-3 max-h-64 overflow-y-auto">
                    {alunos.map((aluno) => (
                      <div key={aluno.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={String(aluno.id)}
                          checked={formData.learner_ids.includes(aluno.id)}
                          onCheckedChange={() => handleToggleAluno(aluno.id)}
                        />
                        <label
                          htmlFor={String(aluno.id)}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {aluno.name}
                          {aluno.email && <span className="text-gray-500 ml-2">({aluno.email})</span>}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Salvando..." : editingGrupo ? "Salvar Alterações" : "Criar Grupo"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este grupo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}