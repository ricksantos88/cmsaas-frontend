import { useEffect, useState } from 'react'
import { AlertCircle, Check, Copy, KeyRound, Loader2, ShieldCheck } from 'lucide-react'
import { useInviteUser } from './users.queries'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/textarea'
import { Dialog, DialogContent } from '@/shared/ui/dialog'
import { notifyError, notifySuccess } from '@/shared/ui/toast'
import { ROLE_LABELS, type Role } from '@/shared/types/roles'
import type { UserInviteResponse } from '@/shared/types/domain'

interface InviteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hasPresident?: boolean
  entity: {
    name: string
    email: string
    isPastor?: boolean
    currentRole?: 'PASTOR_PRESIDENT' | 'PASTOR_AUXILIARY'
  } | null
}

const PASTOR_ROLES: Role[] = [
  'PASTOR_PRESIDENT',
  'PASTOR_AUXILIARY',
  'ADMIN_CHURCH',
  'TREASURER',
  'WORSHIP_LEADER',
  'MEMBER',
]

const MEMBER_ROLES: Role[] = [
  'ADMIN_CHURCH',
  'TREASURER',
  'WORSHIP_LEADER',
  'MEMBER',
]

export function InviteUserDialog({ open, onOpenChange, hasPresident = false, entity }: InviteUserDialogProps) {
  const inviteUser = useInviteUser()
  const [selectedRoles, setSelectedRoles] = useState<Role[]>(() => {
    if (entity?.isPastor) {
      return entity.currentRole === 'PASTOR_PRESIDENT'
        ? ['PASTOR_PRESIDENT']
        : ['PASTOR_AUXILIARY']
    }
    return ['ADMIN_CHURCH']
  })
  const [result, setResult] = useState<UserInviteResponse | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (entity) {
      if (entity.isPastor) {
        setSelectedRoles(
          entity.currentRole === 'PASTOR_PRESIDENT'
            ? ['PASTOR_PRESIDENT']
            : ['PASTOR_AUXILIARY'],
        )
      } else {
        setSelectedRoles(['ADMIN_CHURCH'])
      }
      setResult(null)
      setCopied(false)
    }
  }, [entity])

  if (!entity) return null

  const availableRoles = entity.isPastor ? PASTOR_ROLES : MEMBER_ROLES

  function handleRoleToggle(role: Role) {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    )
  }

  async function handleGenerate() {
    if (selectedRoles.length === 0) {
      notifyError('Selecione ao menos um papel no sistema.')
      return
    }

    try {
      const resp = await inviteUser.mutateAsync({
        name: entity!.name,
        email: entity!.email,
        roles: selectedRoles,
      })
      setResult(resp)
      notifySuccess('Acesso gerado com sucesso!')
    } catch (err: unknown) {
      notifyError(err, 'Erro ao gerar acesso.')
    }
  }

  function handleCopy() {
    if (!result) return
    const firstAccessUrl = `${window.location.origin}/primeiro-acesso?email=${encodeURIComponent(result.email)}&token=${result.token}`
    const text = [
      `Olá, ${entity!.name}!`,
      'Você foi convidado para acessar o console da igreja.',
      `Seu código de primeiro acesso: ${result.token}`,
      '(Válido por 48 horas)',
      '',
      `Acesse para cadastrar sua senha: ${firstAccessUrl}`,
    ].join('\n')

    void navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
    notifySuccess('Dados de acesso copiados!')
  }

  function handleClose() {
    setResult(null)
    setCopied(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        title={result ? 'Acesso Criado com Sucesso' : 'Tornar Usuário do Sistema'}
        description={
          result
            ? 'Compartilhe o código de 4 dígitos ou envie o link diretamente para o usuário.'
            : `Gere credenciais de acesso para ${entity.name} (${entity.email}).`
        }
      >
        {result ? (
          <div className="space-y-6 py-2">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-content-muted">
                Código de 4 Dígitos
              </span>
              <div className="text-4xl font-mono font-bold tracking-widest text-primary">
                {result.token}
              </div>
              <p className="text-xs text-content-muted">
                Expira em 48 horas. Ao ser utilizado no primeiro acesso, este código será invalidado.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button variant="outline" className="w-full" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="size-4 text-success" aria-hidden />
                    Copiado para a área de transferência!
                  </>
                ) : (
                  <>
                    <Copy className="size-4" aria-hidden />
                    Copiar mensagem e link para WhatsApp
                  </>
                )}
              </Button>
              <Button className="w-full" onClick={handleClose}>
                Concluir
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5 py-2">
            <div className="rounded-lg bg-surface-muted p-3 text-sm">
              <div className="font-medium text-content">{entity.name}</div>
              <div className="text-content-muted">{entity.email}</div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-content">
                Papéis / Permissões no Sistema
              </label>
              {entity.isPastor && !hasPresident && (
                <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-2.5 text-xs text-primary">
                  <AlertCircle className="size-4 shrink-0" aria-hidden />
                  <span>
                    Esta congregação ainda não possui Pastor Presidente. Você pode promovê-lo marcando a opção abaixo.
                  </span>
                </div>
              )}
              <div className="grid gap-2 sm:grid-cols-2">
                {availableRoles.map((role) => {
                  const isPresidentDisabled = Boolean(
                    role === 'PASTOR_PRESIDENT' && hasPresident && entity.currentRole !== 'PASTOR_PRESIDENT',
                  )

                  if (isPresidentDisabled) {
                    return (
                      <label
                        key={role}
                        className="flex items-start gap-2 rounded-lg border border-border-subtle bg-surface-muted/40 p-2.5 text-sm opacity-60 cursor-not-allowed"
                      >
                        <Checkbox checked={false} disabled aria-disabled />
                        <div>
                          <span className="text-content font-medium">{ROLE_LABELS[role]}</span>
                          <span className="block text-[11px] text-content-muted">
                            Igreja já possui Pastor Presidente
                          </span>
                        </div>
                      </label>
                    )
                  }

                  return (
                    <label
                      key={role}
                      className="flex items-center gap-2 rounded-lg border border-border-subtle p-2.5 text-sm hover:bg-surface-muted cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedRoles.includes(role)}
                        onChange={() => handleRoleToggle(role)}
                      />
                      <span className="text-content font-medium">{ROLE_LABELS[role]}</span>
                    </label>
                  )
                })}
              </div>
              <p className="text-xs text-content-muted">
                Usuários com papéis administrativos terão acesso a este console web.
              </p>
            </div>

            <div className="flex items-start gap-2 rounded-lg border border-border-subtle bg-surface-muted/50 p-3 text-xs text-content-muted">
              <KeyRound className="size-4 shrink-0 text-primary mt-0.5" aria-hidden />
              <span>
                Um código numérico de 4 dígitos será gerado e ficará associado ao e-mail. O usuário
                poderá definir sua senha no primeiro acesso em até 48 horas.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border-subtle">
              <Button variant="outline" onClick={handleClose} disabled={inviteUser.isPending}>
                Cancelar
              </Button>
              <Button onClick={handleGenerate} disabled={inviteUser.isPending}>
                {inviteUser.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Gerando...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="size-4" aria-hidden />
                    Gerar Acesso
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
