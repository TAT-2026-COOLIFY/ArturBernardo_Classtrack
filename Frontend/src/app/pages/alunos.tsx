import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
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
import { getAlunos, addAluno, updateAluno, deleteAluno, type Aluno } from "@/app/services/alunos";
import { getPlanos, type Plano } from "@/app/services/planos";

const emptyForm = {
  name: "",
  email: "",
  contact: "",
  plan_id: "",
  observation: "",
};

export function Alunos() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);
  const [alunoToDelete, setAlunoToDelete] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    loadAlunos();
    loadPlanos();
  }, []);

  const loadAlunos = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAlunos();
      setAlunos(data);
    } catch (err) {
      setError("Não foi possível carregar os alunos.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPlanos = async () => {
    try {
      const data = await getPlanos();
      setPlanos(data);
    } catch (err) {
      console.error("Erro ao carregar planos:", err);
    }
  };

  const handleOpenDialog = (aluno?: Aluno) => {
    if (aluno) {
      setEditingAluno(aluno);
      setFormData({
        name: aluno.name,
        email: aluno.email ?? "",
        contact: aluno.contact ?? "",
        plan_id: aluno.plan_id ? String(aluno.plan_id) : "",
        observation: aluno.observation ?? "",
      });
    } else {
      setEditingAluno(null);
      setFormData(emptyForm);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAluno(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (editingAluno) {
        await updateAluno(editingAluno.id, formData);
      } else {
        await addAluno(formData);
      }
      await loadAlunos();
      handleCloseDialog();
    } catch (err) {
      setError("Erro ao salvar aluno. Verifique os dados e tente novamente.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setAlunoToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (alunoToDelete) {
      try {
        await deleteAluno(alunoToDelete);
        await loadAlunos();
      } catch (err) {
        setError("Erro ao excluir aluno.");
        console.error(err);
      }
    }
    setIsDeleteDialogOpen(false);
    setAlunoToDelete(null);
  };

  const filteredAlunos = alunos.filter((aluno) =>
    aluno.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (aluno.email ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-semibold text-gray-900">Alunos</h2>
          <p className="text-gray-600 mt-2">Gerencie seus alunos cadastrados</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="size-4" />
          Adicionar Aluno
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
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-gray-400" />
        </div>
      ) : filteredAlunos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">
              {searchTerm
                ? "Nenhum aluno encontrado com esse termo de busca."
                : "Nenhum aluno cadastrado ainda. Clique em 'Adicionar Aluno' para começar."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAlunos.map((aluno) => (
            <Card key={aluno.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{aluno.name}</h3>
                    {aluno.email && <p className="text-sm text-gray-500">{aluno.email}</p>}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(aluno)}>
                      <Edit className="size-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(aluno.id)}>
                      <Trash2 className="size-4 text-red-600" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {aluno.contact && (
                    <div>
                      <span className="text-gray-500">Contato:</span>{" "}
                      <span className="text-gray-900">{aluno.contact}</span>
                    </div>
                  )}
                  {aluno.observation && (
                    <div>
                      <span className="text-gray-500">Observações:</span>{" "}
                      <p className="text-gray-900 mt-1">{aluno.observation}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog para adicionar/editar aluno */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>{editingAluno ? "Editar Aluno" : "Adicionar Novo Aluno"}</DialogTitle>
            <DialogDescription>
              {editingAluno
                ? "Atualize as informações do aluno abaixo."
                : "Preencha os dados do novo aluno abaixo."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="João Silva"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="joao@exemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contato</Label>
                <Input
                  id="contact"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan_id">Plano *</Label>
                <Select
                  value={formData.plan_id}
                  onValueChange={(value) => setFormData({ ...formData, plan_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                  <SelectContent>
                    {planos.map((plano) => (
                      <SelectItem key={plano.id} value={String(plano.id)}>
                        {plano.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="observation">Observações</Label>
                <Textarea
                  id="observation"
                  value={formData.observation}
                  onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
                  placeholder="Informações adicionais sobre o aluno..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Salvando..." : editingAluno ? "Salvar Alterações" : "Adicionar Aluno"}
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
              Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita.
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