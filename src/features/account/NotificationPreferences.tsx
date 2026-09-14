import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { usePreferences, useUpdatePreferences } from './preferences.queries'
import type { PreferencesResponse } from './preferences.api'
import { Button } from '@/shared/ui/button'
import { Card, CardBody, CardHeader, CardTitle } from '@/shared/ui/card'
import { CardSkeleton } from '@/shared/ui/skeleton'
import { ErrorState } from '@/shared/ui/states'
import { Checkbox } from '@/shared/ui/textarea'
import { notifyError, notifySuccess } from '@/shared/ui/toast'
import { NOTIFICATION_TYPE_LABELS } from '@/shared/types/labels'
import type { NotificationType } from '@/shared/types/domain'

type Preferences = PreferencesResponse['types']

/**
 * Preferência por tipo de aviso. O backend consulta isto **antes** de cada canal:
 * canal desligado fica `SKIPPED`, mas o aviso continua chegando na inbox
 * (notification.md → preferências).
 */
export function NotificationPreferences() {
  const query = usePreferences()
  const updatePreferences = useUpdatePreferences()
  const [draft, setDraft] = useState<Preferences | null>(null)

  useEffect(() => {
    if (query.data) setDraft(query.data.types)
  }, [query.data])

  function toggle(type: NotificationType, channel: 'push' | 'email', enabled: boolean) {
    setDraft((current) =>
      current
        ? { ...current, [type]: { ...current[type], [channel]: enabled } }
        : current,
    )
  }

  async function save() {
    if (!draft) return
    try {
      await updatePreferences.mutateAsync(draft)
      notifySuccess('Preferências salvas.')
    } catch (error) {
      notifyError(error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferências de notificação</CardTitle>
      </CardHeader>

      {query.isPending && <CardSkeleton rows={5} />}
      {query.isError && <ErrorState error={query.error} onRetry={() => void query.refetch()} />}

      {draft && (
        <CardBody className="space-y-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="pb-2 text-left text-xs font-semibold tracking-wide text-content-muted uppercase">
                    Tipo de aviso
                  </th>
                  <th className="w-24 pb-2 text-center text-xs font-semibold tracking-wide text-content-muted uppercase">
                    App
                  </th>
                  <th className="w-24 pb-2 text-center text-xs font-semibold tracking-wide text-content-muted uppercase">
                    E-mail
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {(Object.keys(NOTIFICATION_TYPE_LABELS) as NotificationType[]).map((type) => {
                  const preference = draft[type] ?? { push: false, email: false }
                  return (
                    <tr key={type}>
                      <td className="py-2.5 text-content">{NOTIFICATION_TYPE_LABELS[type]}</td>
                      <td className="text-center">
                        <Checkbox
                          aria-label={`Receber ${NOTIFICATION_TYPE_LABELS[type]} no aplicativo`}
                          checked={preference.push}
                          onChange={(event) => toggle(type, 'push', event.target.checked)}
                        />
                      </td>
                      <td className="text-center">
                        <Checkbox
                          aria-label={`Receber ${NOTIFICATION_TYPE_LABELS[type]} por e-mail`}
                          checked={preference.email}
                          onChange={(event) => toggle(type, 'email', event.target.checked)}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-content-muted">
            Desligar um canal não esconde o aviso: ele continua aparecendo em Notificações,
            apenas não é enviado por ali.
          </p>

          <div className="flex justify-end">
            <Button onClick={() => void save()} disabled={updatePreferences.isPending}>
              {updatePreferences.isPending && <Loader2 className="animate-spin" aria-hidden />}
              Salvar preferências
            </Button>
          </div>
        </CardBody>
      )}
    </Card>
  )
}
