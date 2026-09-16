import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useUpdateUserRoles, useUsers } from './users.queries'
import { ApiError } from '@/shared/api/api-error'
import type { Role } from '@/shared/types/roles'
import { ROLE_LABELS } from '@/shared/types/roles'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogClose, DialogContent } from '@/shared/ui/dialog'
import { notifySuccess } from '@/shared/ui/toast'

interface UpdateUserRolesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  userName: string
  currentRoles?: Role[]
}

const AVAILABLE_ROLES: { role: Role; description: string }[] = [
  {
    role: 'PASTOR_PRESIDENT',
    description: 'Gestão pastoral máxima da congregação (máximo 1 titular por igreja).',
  },
  {
    role: 'PASTOR_AUXILIARY',
    description: 'Atendimento pastoral, acompanhamento de visitas e redes ministeriais.',
  },
  {
    role: 'ADMIN_CHURCH',
    description: 'Gestão administrativa, secretaria, usuários e membros.',
  },
  {
    role: 'TREASURER',
    description: 'Controle de entradas/saídas financeiras, categorias e relatórios.',
  },
  {
    role: 'WORSHIP_LEADER',
    description: 'Gestão do ministério de louvor, repertório e escalas de músicos.',
  },
  {
    role: 'MEMBER',
    description: 'Papel base de membro da igreja.',
  },
]

export function UpdateUserRolesDialog({
  open,
  onOpenChange,
  userId,
  userName,
  currentRoles = ['MEMBER'],
}: UpdateUserRolesDialogProps) {
  const usersQuery = useUsers(open)
  const updateRoles = useUpdateUserRoles()
  const [selectedRoles, setSelectedRoles] = useState<Role[]>(currentRoles)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setFormError(null)
      const matchedUser = usersQuery.data?.find((u) => u.id === userId)
      if (matchedUser?.roles && matchedUser.roles.length > 0) {
        setSelectedRoles(matchedUser.roles as Role[])
      } else if (currentRoles && currentRoles.length > 0) {
        setSelectedRoles(currentRoles)
      } else {
        setSelectedRoles(['MEMBER'])
      }
    }
  }, [open, currentRoles, userId, usersQuery.data])

  function toggleRole(role: Role) {
    setSelectedRoles((prev) => {
      if (prev.includes(role)) {
        if (prev.length === 1) return prev
        return prev.filter((r) => r !== role)
      }
      return [...prev, role]
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    if (selectedRoles.length === 0) {
      setFormError('Selecione ao menos um papel para o usuário.')
      return
    }

    try {
      await updateRoles.mutateAsync({ userId, roles: selectedRoles })
      notifySuccess('Papéis do usuário atualizados com sucesso.')
      onOpenChange(false)
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message)
      } else {
        setFormError('Não foi possível atualizar os papéis. Tente novamente.')
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Alterar Papéis (Roles) do Usuário"
        description={`Gerencie as permissões de acesso de ${userName} no console web da igreja.`}
        footer={
          <>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={updateRoles.isPending}>
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={(e) => void handleSubmit(e)}
              disabled={updateRoles.isPending}
            >
              {updateRoles.isPending && <Loader2 className="animate-spin mr-2 size-4" aria-hidden />}
              Salvar Alterações
            </Button>
          </>
        }
      >
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          {usersQuery.isPending ? (
            <div className="flex items-center justify-center p-8 text-sm text-content-muted">
              <Loader2 className="animate-spin size-5 mr-2" aria-hidden />
              <span>Carregando papéis do usuário...</span>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {AVAILABLE_ROLES.map(({ role, description }) => {
                const isChecked = selectedRoles.includes(role)
                return (
                  <label
                    key={role}
                    className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                      isChecked
                        ? 'border-accent bg-accent/5'
                        : 'border-border-subtle bg-surface hover:bg-surface-muted'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleRole(role)}
                      className="mt-0.5 size-4 rounded border-border-subtle text-accent focus:ring-accent"
                    />
                    <div className="space-y-0.5 text-sm">
                      <p className="font-semibold text-content">{ROLE_LABELS[role]}</p>
                      <p className="text-xs text-content-muted leading-relaxed">{description}</p>
                    </div>
                  </label>
                )
              })}
            </div>
          )}

          {formError && (
            <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
              {formError}
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
