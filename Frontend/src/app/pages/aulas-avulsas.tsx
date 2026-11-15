import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Card, CardContent } from "@/app/components/ui/card";
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
import {
  getAulasAvulsas,
  addAulaAvulsa,
  updateAulaAvulsa,
  deleteAulaAvulsa,
  type AulaAvulsa,
} from "@/app/services/aulasavulsas";

const emptyForm = {
  name: "",
  date: "",
  observation: "",
  value: "",
};

export function AulasAvulsas() {
  const [aulas, setAulas] = useState<AulaAvulsa[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingAula, setEditingAula] = useState<AulaAvulsa | null>(null);
  const [aulaToDelete, setAulaToDelete] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    loadAulas();
  }, []);

  const loadAulas = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAulasAvulsas();
      setAulas(data ?? []);
    } catch (err) {
      setError("Não foi possível carregar as aulas avulsas.");
      setAulas([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (aula?: AulaAvulsa) => {
    if (aula) {
      setEditingAula(aula);
      setFormData({
        name: aula.name,
        date: aula.date,
        observation: aula.observation ?? "",
        value: aula.value.toString(),
      });
    } else {
      setEditingAula(null);
      setFormData(emptyForm);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAula(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const value = parseFloat(formData.value);
    if (value < 0) {
      setError("Por favor, insira um valor válido.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        name: formData.name,
        date: formData.date,
        observation: formData.observation,
        value,
      };

      if (editingAula) {
        await updateAulaAvulsa(editingAula.id, payload);
      } else {
        await addAulaAvulsa(payload);
      }

      await loadAulas();
      handleCloseDialog();
    } catch (err) {
      setError("Erro ao salvar aula avulsa. Verifique os dados e tente novamente.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setAulaToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (aulaToDelete) {
      try {
        await deleteAulaAvulsa(aulaToDelete);
        await loadAulas();
      } catch (err) {
        setError("Erro ao excluir aula avulsa.");
        console.error(err);
      }
    }
    setIsDeleteDialogOpen(false);
    setAulaToDelete(null);
  };

  const filteredAulas = aulas.filter((aula) =>
    aula.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-semibold text-gray-900">Aulas Avulsas</h2>
          <p className="text-gray-600 mt-2">Gerencie aulas cobradas fora dos planos e turmas</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="size-4" />
          Nova Aula Avulsa
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
            placeholder="Buscar por nome..."
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
      ) : filteredAulas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">
              {searchTerm
                ? "Nenhuma aula avulsa encontrada com esse termo de busca."
                : "Nenhuma aula avulsa cadastrada ainda. Clique em 'Nova Aula Avulsa' para começar."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAulas.map((aula) => (
                  <TableRow key={aula.id}>
                    <TableCell className="font-medium">{aula.name}</TableCell>
                    <TableCell>
                      {new Date(aula.date).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>R$ {Number(aula.value).toFixed(2) || "-"}</TableCell>
                    <TableCell className="max-w-xs truncate text-gray-600">
                      {aula.observation || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(aula)}>
                          <Edit className="size-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(aula.id)}>
                          <Trash2 className="size-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Dialog para adicionar/editar aula avulsa */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>
              {editingAula ? "Editar Aula Avulsa" : "Nova Aula Avulsa"}
            </DialogTitle>
            <DialogDescription>
              {editingAula
                ? "Atualize as informações da aula avulsa abaixo."
                : "Preencha os dados da nova aula avulsa."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Aula experimental - João"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="observation">Observações</Label>
                <Textarea
                  id="observation"
                  value={formData.observation}
                  onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
                  placeholder="Informações adicionais sobre a aula..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Salvando..." : editingAula ? "Salvar Alterações" : "Criar Aula Avulsa"}
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
              Tem certeza que deseja excluir esta aula avulsa? Esta ação não pode ser desfeita.
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