import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Plus, X } from 'lucide-react'
import { z } from 'zod'
import { useSaveSermon, useSermon } from './sermons.queries'
import { usePastorOptions } from '@/shared/queries/options.queries'
import { Button } from '@/shared/ui/button'
import { Card, CardBody } from '@/shared/ui/card'
import { Field } from '@/shared/ui/field'
import { FormActions, FormRow, FormSection } from '@/shared/ui/form'
import { Input, Select } from '@/shared/ui/input'
import { PageHeader } from '@/shared/ui/page-header'
import { CardSkeleton } from '@/shared/ui/skeleton'
import { ErrorState } from '@/shared/ui/states'
import { Textarea } from '@/shared/ui/textarea'
import { notifySuccess } from '@/shared/ui/toast'
import { useApiForm } from '@/shared/lib/use-api-form'
import { blankToNull, blankToUndefined, numberOrUndefined } from '@/shared/lib/payload'
import {
  SERMON_TOPIC_LABELS,
  SERMON_TYPE_LABELS,
  SERMON_VISIBILITY_LABELS,
} from '@/shared/types/labels'
import type { BibleReference, Sermon, SermonTopic, SermonType, SermonVisibility } from '@/shared/types/domain'

const optionalText = z.string().trim().optional().or(z.literal(''))

const sermonSchema = z.object({
  title: z.string().trim().min(3, 'Mínimo de 3 caracteres').max(255),
  description: optionalText,
  preacherId: optionalText,
  sermonDate: z.string().min(1, 'Informe a data'),
  sermonTime: optionalText,
  duration: optionalText,
  topic: z.string().min(1),
  sermonType: z.string().min(1),
  youtubeLink: optionalText,
  visibility: z.string().min(1),
  keywords: optionalText,
})

type SermonFormValues = z.infer<typeof sermonSchema>

export function SermonFormPage() {
  const { id } = useParams<{ id: string }>()
  const query = useSermon(id)
  const isEditing = Boolean(id)

  if (isEditing && query.isPending) {
    return (
      <div className="space-y-6">
        <PageHeader title="Editar sermão" />
        <Card>
          <CardSkeleton rows={8} />
        </Card>
      </div>
    )
  }

  if (isEditing && query.isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Editar sermão" />
        <Card>
          <ErrorState error={query.error} onRetry={() => void query.refetch()} />
        </Card>
      </div>
    )
  }

  return <SermonForm sermon={query.data} />
}

function SermonForm({ sermon }: { sermon: Sermon | undefined }) {
  const navigate = useNavigate()
  const isEditing = Boolean(sermon)
  const saveSermon = useSaveSermon(sermon?.id)
  const pastors = usePastorOptions()

  // Referências bíblicas são uma lista dinâmica: estado próprio, fora do RHF.
  const [references, setReferences] = useState<BibleReference[]>(sermon?.bibleReferences ?? [])

  const form = useApiForm<SermonFormValues>({
    schema: sermonSchema,
    defaultValues: {
      title: sermon?.title ?? '',
      description: sermon?.description ?? '',
      preacherId: sermon?.preacher?.id ?? '',
      sermonDate: sermon?.sermonDate ?? new Date().toISOString().slice(0, 10),
      sermonTime: sermon?.sermonTime ?? '',
      duration: sermon?.duration?.toString() ?? '',
      topic: sermon?.topic ?? 'OTHER',
      sermonType: sermon?.sermonType ?? 'SUNDAY_PREACHING',
      youtubeLink: sermon?.youtubeLink ?? '',
      visibility: sermon?.visibility ?? 'PUBLIC',
      keywords: sermon?.keywords.join(', ') ?? '',
    },
    onSubmit: async (values) => {
      await saveSermon.mutateAsync({
        title: values.title.trim(),
        sermonDate: values.sermonDate,
        topic: values.topic as SermonTopic,
        sermonType: values.sermonType as SermonType,
        visibility: values.visibility as SermonVisibility,
        bibleReferences: references.filter((reference) => reference.book.trim()),
        keywords: values.keywords
          ?.split(',')
          .map((keyword) => keyword.trim())
          .filter(Boolean),
        // Limpáveis na edição.
        description: isEditing ? blankToNull(values.description) : blankToUndefined(values.description),
        preacherId: isEditing ? blankToNull(values.preacherId) : blankToUndefined(values.preacherId),
        sermonTime: isEditing ? blankToNull(values.sermonTime) : blankToUndefined(values.sermonTime),
        duration: isEditing
          ? (numberOrUndefined(values.duration) ?? null)
          : numberOrUndefined(values.duration),
        youtubeLink: isEditing ? blankToNull(values.youtubeLink) : blankToUndefined(values.youtubeLink),
      })
    },
    onSuccess: () => {
      notifySuccess(isEditing ? 'Sermão atualizado.' : 'Sermão registrado.')
      void navigate('/sermoes')
    },
  })

  const { register, formState, submit, submitting } = form

  function updateReference(index: number, changes: Partial<BibleReference>) {
    setReferences((current) =>
      current.map((reference, position) =>
        position === index ? { ...reference, ...changes } : reference,
      ),
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditing ? 'Editar sermão' : 'Novo sermão'}
        description={isEditing ? sermon?.title : 'Registre a pregação no acervo da igreja.'}
      />

      <Card>
        <CardBody>
          <form className="space-y-6" onSubmit={(event) => void submit(event)} noValidate>
            <FormSection title="Sermão">
              <FormRow>
                <Field label="Título" required error={formState.errors.title?.message}>
                  {(field) => <Input {...field} {...register('title')} />}
                </Field>
              </FormRow>
              <Field label="Pregador">
                {(field) => (
                  <Select {...field} {...register('preacherId')}>
                    <option value="">Não informado</option>
                    {pastors.data?.data.map((pastor) => (
                      <option key={pastor.id} value={pastor.id}>
                        {pastor.name}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label="Data" required error={formState.errors.sermonDate?.message}>
                {(field) => <Input type="date" {...field} {...register('sermonDate')} />}
              </Field>
              <Field label="Horário">
                {(field) => <Input type="time" {...field} {...register('sermonTime')} />}
              </Field>
              <Field label="Duração (minutos)" hint="Entre 1 e 180.">
                {(field) => <Input type="number" min="1" max="180" {...field} {...register('duration')} />}
              </Field>
              <Field label="Tópico" required>
                {(field) => (
                  <Select {...field} {...register('topic')}>
                    {Object.entries(SERMON_TOPIC_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label="Tipo" required>
                {(field) => (
                  <Select {...field} {...register('sermonType')}>
                    {Object.entries(SERMON_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <FormRow>
                <Field label="Descrição">
                  {(field) => <Textarea rows={3} {...field} {...register('description')} />}
                </Field>
              </FormRow>
            </FormSection>

            <FormSection title="Referências bíblicas">
              <FormRow>
                <div className="space-y-3">
                  {references.map((reference, index) => (
                    <div key={index} className="flex flex-wrap items-end gap-2">
                      <Input
                        className="min-w-40 flex-1"
                        placeholder="Livro"
                        aria-label={`Livro da referência ${index + 1}`}
                        value={reference.book}
                        onChange={(event) => updateReference(index, { book: event.target.value })}
                      />
                      <Input
                        className="w-24"
                        type="number"
                        min="1"
                        max="150"
                        placeholder="Cap."
                        aria-label={`Capítulo da referência ${index + 1}`}
                        value={reference.chapter}
                        onChange={(event) =>
                          updateReference(index, { chapter: Number(event.target.value) })
                        }
                      />
                      <Input
                        className="w-32"
                        placeholder="Versículos"
                        aria-label={`Versículos da referência ${index + 1}`}
                        value={reference.verses ?? ''}
                        onChange={(event) => updateReference(index, { verses: event.target.value })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Remover referência ${index + 1}`}
                        onClick={() =>
                          setReferences((current) => current.filter((_, position) => position !== index))
                        }
                      >
                        <X aria-hidden />
                      </Button>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setReferences((current) => [...current, { book: '', chapter: 1 }])}
                  >
                    <Plus aria-hidden />
                    Adicionar referência
                  </Button>
                </div>
              </FormRow>
            </FormSection>

            <FormSection title="Publicação">
              <Field
                label="Link do YouTube"
                hint="O player é montado pelo servidor a partir do id do vídeo."
              >
                {(field) => (
                  <Input placeholder="https://youtu.be/…" {...field} {...register('youtubeLink')} />
                )}
              </Field>
              <Field label="Visibilidade" required>
                {(field) => (
                  <Select {...field} {...register('visibility')}>
                    {Object.entries(SERMON_VISIBILITY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <FormRow>
                <Field label="Palavras-chave" hint="Separadas por vírgula.">
                  {(field) => <Input placeholder="fé, graça" {...field} {...register('keywords')} />}
                </Field>
              </FormRow>
            </FormSection>

            <FormActions
              onCancel={() => void navigate('/sermoes')}
              submitting={submitting}
              submitLabel={isEditing ? 'Salvar alterações' : 'Registrar sermão'}
            />
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
