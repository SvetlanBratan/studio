'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Turn, CharacterStats } from '@/types/duel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2 } from 'lucide-react';

const formSchema = z.object({
  bonuses: z.string().optional(),
  penalties: z.string().optional(),
  passiveEffects: z.string().optional(),
  actions: z.array(z.object({
    description: z.string().min(1, 'Описание не может быть пустым.'),
    costType: z.enum(['om', 'od', 'none']),
    cost: z.coerce.number().min(0, 'Стоимость не может быть отрицательной.'),
  })).min(1, 'Нужно хотя бы одно действие.').max(2, 'Не более двух действий за ход.'),
});

type TurnFormValues = z.infer<typeof formSchema>;

interface TurnFormProps {
  player: CharacterStats;
  onSubmit: (data: Omit<Turn, 'turnNumber' | 'startStats' | 'endStats'>) => void;
}

export default function TurnForm({ player, onSubmit }: TurnFormProps) {
  const form = useForm<TurnFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bonuses: '',
      penalties: '',
      passiveEffects: '',
      actions: [{ description: '', costType: 'none', cost: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'actions',
  });

  const handleFormSubmit = (values: TurnFormValues) => {
    onSubmit({
      playerId: player.id,
      playerName: player.name,
      ...values,
      passiveEffects: values.passiveEffects || 'Нет',
      bonuses: values.bonuses || 'Нет',
      penalties: values.penalties || 'Нет',
    });
    form.reset({
      bonuses: '',
      penalties: '',
      passiveEffects: '',
      actions: [{ description: '', costType: 'none', cost: 0 }],
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="bonuses"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Бонусы</FormLabel>
                <FormControl>
                  <Input placeholder="Иммунитет к огню..." {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="penalties"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Штрафы</FormLabel>
                <FormControl>
                  <Input placeholder="Изнеможден..." {...field} />
                </FormControl>
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="passiveEffects"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Пассивные эффекты</FormLabel>
                <FormControl>
                  <Input placeholder="+25 OM..." {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        
        <div className="space-y-4">
          <FormLabel>Действия</FormLabel>
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2 p-3 border rounded-lg bg-background/50">
              <span className="font-bold text-lg text-primary pt-1.5">{index + 1}.</span>
              <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-2">
                <FormField
                  control={form.control}
                  name={`actions.${index}.description`}
                  render={({ field }) => (
                    <FormItem className="md:col-span-3">
                      <FormControl>
                        <Textarea placeholder="Описание действия..." {...field} />
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`actions.${index}.costType`}
                  render={({ field }) => (
                    <FormItem>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Тип затрат" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Без затрат</SelectItem>
                          <SelectItem value="om">ОМ</SelectItem>
                          <SelectItem value="od">ОД</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name={`actions.${index}.cost`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="number" placeholder="Стоимость" {...field} />
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="button" variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 shrink-0" onClick={() => remove(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {fields.length < 2 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ description: '', costType: 'none', cost: 0 })}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Добавить действие
            </Button>
          )}
        </div>

        <Button type="submit" className="w-full">Завершить ход</Button>
      </form>
    </Form>
  );
}
